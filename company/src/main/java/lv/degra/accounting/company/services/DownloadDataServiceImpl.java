package lv.degra.accounting.company.services;

import jakarta.persistence.EntityManager;
import lombok.extern.slf4j.Slf4j;
import lv.degra.accounting.company.CsvParser;
import lv.degra.accounting.company.exception.IllegalCsvColumnCountException;
import lv.degra.accounting.core.company.model.Company;
import lv.degra.accounting.core.company.model.CompanyRepository;
import lv.degra.accounting.core.company.type.model.CompanyType;
import lv.degra.accounting.core.company.type.model.CompanyTypeRepository;
import lv.degra.accounting.core.system.files.FileService;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.DigestUtils;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.time.LocalDate;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Slf4j
public class DownloadDataServiceImpl implements DownloadDataService {

    public static final Integer COMPANY_CSV_DATA_COLUMN_COUNT = 21;
    private final FileService fileService;
    private final CsvParser csvParser;
    private final CompanyRepository companyRepository;
    private final CompanyTypeRepository companyTypeRepository;
    private final EntityManager entityManager;
    private final List<String> previousFilesChecksums = new ArrayList<>();

    @Value("${application.company_data_file_url}")
    private String companyDataFileUrl;

    public DownloadDataServiceImpl(FileService fileService, CsvParser csvParser, CompanyRepository companyRepository,
                                   CompanyTypeRepository companyTypeRepository, EntityManager entityManager) {
        this.fileService = fileService;
        this.csvParser = csvParser;
        this.companyRepository = companyRepository;
        this.companyTypeRepository = companyTypeRepository;
        this.entityManager = entityManager;
    }

    @Scheduled(cron = "${companyDataDownloadCron}")
    private void scheduleTaskUsingCronExpression() {
        downloadFullCompanyData();
    }

    public void downloadData() {
        log.info("Company data import started");
        byte[] csvFileBytes = fileService.downloadFileByUrl(companyDataFileUrl);
        if (csvFileBytes != null && csvFileBytes.length > 0) {
            try (InputStreamReader reader = new InputStreamReader(new ByteArrayInputStream(csvFileBytes))) {
                importCompanyData(reader, COMPANY_CSV_DATA_COLUMN_COUNT);
            } catch (IOException e) {
                log.error("Error closing input stream", e);
            }
        } else {
            log.warn("Company data CSV file could not be downloaded");
        }
        log.info("Company data import finished");
    }

    @Transactional
    public void importCompanyData(Reader file, int rowColumnCount) {
        List<Company> companiesToSave = new ArrayList<>();
        List<String[]> lineData = csvParser.getDataLines(file);

        Map<String, CompanyType> companyTypeMap = companyTypeRepository.findAll()
                .stream()
                .collect(Collectors.toMap(CompanyType::getName, Function.identity()));

        saveUniqueCompanyTypes(getUniqueCompanyTypes(lineData));

        lineData.stream().forEach(line -> {
            CompanyType companyType = companyTypeMap.getOrDefault(line[9], null);
            companiesToSave.add(getCompanyData(Arrays.asList(line), rowColumnCount, companyType));

            if (companiesToSave.size() >= getBatchSize()) {
                saveLargeDataBatch(companiesToSave);
                companiesToSave.clear();
            }
        });

        if (!companiesToSave.isEmpty()) {
            saveLargeDataBatch(companiesToSave);
        }
    }

    private int getBatchSize() {
        return Integer.parseInt(System.getProperty("data.company-data-import.batch.size", "100"));
    }


    @Transactional
    public void saveLargeDataBatch(List<Company> companyList) {
        companyRepository.saveAll(companyList);
        entityManager.flush();
        entityManager.clear();
    }


    public Set<Map.Entry<String, String>> getUniqueCompanyTypes(List<String[]> lineData) {
        return lineData.stream()
                .map(line -> new AbstractMap.SimpleEntry<>(line[9], line[10]))
                .collect(Collectors.toSet());
    }

    private Company getCompanyData(List<String> csvLineInArray, int rowColumnCount, CompanyType companyType) {
        if (csvLineInArray.size() != rowColumnCount) {
            throw new IllegalCsvColumnCountException(StringUtils.join(csvLineInArray, "|"));
        }

        Company company = new Company();
        company.setRegisterNumber(csvLineInArray.get(0));
        company.setSepaCode(csvLineInArray.get(1));
        company.setName(csvLineInArray.get(2).toUpperCase(Locale.ROOT));
        company.setNameBeforeQuotes(csvLineInArray.get(3).toUpperCase(Locale.ROOT));
        company.setNameInQuotes(csvLineInArray.get(4).isEmpty() ?
                (csvLineInArray.get(3).isEmpty() ? company.getName() : csvLineInArray.get(3).toUpperCase(Locale.ROOT))
                : csvLineInArray.get(4).toUpperCase(Locale.ROOT));
        company.setNameAfterQuotes(csvLineInArray.get(5).toUpperCase(Locale.ROOT));
        company.setCompanyType(companyType);
        company.setRegisteredDate(csvLineInArray.get(11).isEmpty() ? null : LocalDate.parse(csvLineInArray.get(11)));
        company.setTerminatedDate(csvLineInArray.get(12).isEmpty() ? null : LocalDate.parse(csvLineInArray.get(12)));
        company.setName(company.getNameNormalized());

        return company;
    }

    public CompanyType getCompanyType(List<CompanyType> companyTypeList, String code) {
        return companyTypeList.stream()
                .filter(companyType -> companyType.getCode().equals(code))
                .findFirst()
                .orElse(null);
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

    private void downloadFullCompanyData() {
        downloadData();
    }

    private boolean isDataFileChanged(byte[] bytes) {
        String md5 = DigestUtils.md5DigestAsHex(bytes);
        if (!previousFilesChecksums.contains(md5)) {
            previousFilesChecksums.add(md5);
            return true;
        }
        return false;
    }
}
