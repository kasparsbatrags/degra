package lv.degra.accounting.core.company.service;

import jakarta.validation.constraints.NotNull;
import lombok.extern.slf4j.Slf4j;
import lv.degra.accounting.core.company.register.model.CompanyRegister;
import lv.degra.accounting.core.company.type.model.CompanyType;
import lv.degra.accounting.core.company.type.model.CompanyTypeRepository;
import lv.degra.accounting.core.system.configuration.DegraConfig;
import lv.degra.accounting.core.system.configuration.service.ConfigService;
import lv.degra.accounting.core.system.files.FileService;
import org.springframework.jdbc.core.BatchPreparedStatementSetter;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Types;
import java.time.LocalDate;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Slf4j
public class CompanyRegisterServiceImpl implements CompanyRegisterService {

    private final FileService fileService;
    private final CsvParser csvParser;
    private final CompanyTypeRepository companyTypeRepository;
    private final List<String> previousFilesChecksums = new ArrayList<>();
    private final ConfigService configService;
    private final JdbcTemplate jdbcTemplate;

    public CompanyRegisterServiceImpl(FileService fileService, CsvParser csvParser, CompanyTypeRepository companyTypeRepository, ConfigService configService, JdbcTemplate jdbcTemplate) {
        this.fileService = fileService;
        this.csvParser = csvParser;
        this.companyTypeRepository = companyTypeRepository;
        this.configService = configService;
        this.jdbcTemplate = jdbcTemplate;
    }

    public void importData() {
        log.info("Company data import started");
        byte[] csvFileBytes = fileService.downloadFileByUrl(configService.get(DegraConfig.COMPANY_DOWNLOAD_LINK));
        if (csvFileBytes != null && csvFileBytes.length > 0) {
            try (InputStreamReader reader = new InputStreamReader(new ByteArrayInputStream(csvFileBytes))) {
                importCompanyData(reader);
            } catch (IOException e) {
                log.error("Error closing input stream", e);
            }
        } else {
            log.warn("Company data CSV file could not be downloaded");
        }
        log.info("Company data import finished");
    }


    public void importCompanyData(Reader file) {

        List<String[]> lineData = csvParser.getDataLines(file);

        saveUniqueCompanyTypes(getUniqueCompanyTypes(lineData));
        Map<String, CompanyType> companyTypeMap = companyTypeRepository.findAll()
                .stream()
                .collect(Collectors.toMap(CompanyType::getCode, Function.identity()));

        truncateCompanyRegisterTable();
        batchInsertCompanyRegister(getCompaniesLists(lineData, companyTypeMap));
    }

    private List<CompanyRegister> getCompaniesLists(List<String[]> lineData, Map<String, CompanyType> companyTypeMap) {
        List<CompanyRegister> companyRegisterList = new ArrayList<>();
        lineData.forEach(line -> {
            CompanyType companyType = companyTypeMap.getOrDefault(line[9], null);
            companyRegisterList.add(getCompanyData(Arrays.asList(line), companyType));
        });
        return companyRegisterList;
    }

    public void batchInsertCompanyRegister(List<CompanyRegister> companyRegisterList) {
        String sql = """
                
                INSERT INTO company_register
                    (register_number, sepa_code, "name", name_before_quotes, name_in_quotes, name_after_quotes, without_quotes, company_type_id, registered_date, terminated_date)
                    VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                """;

        jdbcTemplate.batchUpdate(sql, new BatchPreparedStatementSetter() {
            @Override
            public void setValues(@NotNull PreparedStatement ps, int i) throws SQLException {
                CompanyRegister companyRegister = companyRegisterList.get(i);
                ps.setString(1, companyRegister.getRegisterNumber());
                ps.setString(2, companyRegister.getSepaCode());
                ps.setString(3, companyRegister.getName());
                ps.setString(4, companyRegister.getNameBeforeQuotes());
                ps.setString(5, companyRegister.getNameInQuotes());
                ps.setString(6, companyRegister.getNameAfterQuotes());
                ps.setString(7, companyRegister.getWithoutQuotes());
                if (companyRegister.getCompanyType() != null) {
                    ps.setLong(8, companyRegister.getCompanyType().getId());
                } else {
                    ps.setNull(8, Types.BIGINT);
                }
                if (companyRegister.getRegisteredDate() != null) {
                    ps.setDate(9, java.sql.Date.valueOf(companyRegister.getRegisteredDate()));
                } else {
                    ps.setNull(9, Types.DATE);
                }
                if (companyRegister.getTerminatedDate() != null) {
                    ps.setDate(10, java.sql.Date.valueOf(companyRegister.getTerminatedDate()));
                } else {
                    ps.setNull(10, Types.DATE);
                }
            }

            @Override
            public int getBatchSize() {
                return companyRegisterList.size();
            }
        });
    }


    public void truncateCompanyRegisterTable() {
        jdbcTemplate.execute("TRUNCATE TABLE company_register");
    }


    public Set<Map.Entry<String, String>> getUniqueCompanyTypes(List<String[]> lineData) {
        return lineData.stream()
                .map(line -> new AbstractMap.SimpleEntry<>(line[9], line[10]))
                .collect(Collectors.toSet());
    }

    private CompanyRegister getCompanyData(List<String> csvLineInArray, CompanyType companyType) {
        CompanyRegister companyRegister = new CompanyRegister();
        companyRegister.setRegisterNumber(csvLineInArray.get(0));
        companyRegister.setSepaCode(csvLineInArray.get(1));
        companyRegister.setName(csvLineInArray.get(2).toUpperCase(Locale.ROOT));
        companyRegister.setNameBeforeQuotes(csvLineInArray.get(3).toUpperCase(Locale.ROOT));
        companyRegister.setNameInQuotes(csvLineInArray.get(4).isEmpty() ?
                (csvLineInArray.get(3).isEmpty() ? companyRegister.getName() : csvLineInArray.get(3).toUpperCase(Locale.ROOT))
                : csvLineInArray.get(4).toUpperCase(Locale.ROOT));
        companyRegister.setNameAfterQuotes(csvLineInArray.get(5).toUpperCase(Locale.ROOT));
        companyRegister.setCompanyType(companyType);
        companyRegister.setRegisteredDate(csvLineInArray.get(11).isEmpty() ? null : LocalDate.parse(csvLineInArray.get(11)));
        companyRegister.setTerminatedDate(csvLineInArray.get(12).isEmpty() ? null : LocalDate.parse(csvLineInArray.get(12)));
        if (companyRegister.getNameNormalized() == null) {
            log.error(companyRegister.getRegisterNumber());
        }
        companyRegister.setName(companyRegister.getNameNormalized());

        return companyRegister;
    }

    public void saveUniqueCompanyTypes(Set<Map.Entry<String, String>> uniqueCompanyTypes) {
        uniqueCompanyTypes.forEach(entry -> {
            String code = entry.getKey();
            String name = entry.getValue();
            CompanyType existingType = companyTypeRepository.getByCode(code).orElse(null);
            if (existingType == null) {
                CompanyType newType = new CompanyType();
                newType.setCode(code);
                newType.setName(name);
                companyTypeRepository.save(newType);
            }
        });
    }
}
