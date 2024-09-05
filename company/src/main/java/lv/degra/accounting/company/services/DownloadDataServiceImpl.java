package lv.degra.accounting.company.services;

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
import org.springframework.util.DigestUtils;

import java.io.ByteArrayInputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;


@Service
@Slf4j
public class DownloadDataServiceImpl implements DownloadDataService {

    public static final Integer COMPANY_CSV_DATA_COLUMN_COUNT = 21;
    private final FileService fileService;
    private final CsvParser csvParser;
    private final CompanyRepository companyRepository;
    private final CompanyTypeRepository companyTypeRepository;
    private final List<String> previousFilesChecksums = new ArrayList<>();

    @Value("${application.company_data_file_url}")
    private String companyDataFileUrl;

    public DownloadDataServiceImpl(FileService fileService, CsvParser csvParser, CompanyRepository companyRepository, CompanyTypeRepository companyTypeRepository) {
        this.fileService = fileService;
        this.csvParser = csvParser;
        this.companyRepository = companyRepository;
        this.companyTypeRepository = companyTypeRepository;
    }

    @Scheduled(cron = "${companyDataDownloadCron}")
    private void scheduleTaskUsingCronExpression() {
        downloadFullCompanyData();
    }

    public void downloadData() {
        log.info("Company data import started");
        byte[] csvFileBytes = fileService.downloadFileByUrl(companyDataFileUrl);
        if (csvFileBytes != null && csvFileBytes.length > 0) {
//            if (isDataFileChanged(csvFileBytes)) {
            importCompanyData(new InputStreamReader(new ByteArrayInputStream(csvFileBytes)), COMPANY_CSV_DATA_COLUMN_COUNT);
//            } else {
//                log.info("Company data csv file not changed");
//            }
        } else {
            log.info("Company data csv file unable to download");
        }
        log.info("Company data import finished");
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

    private boolean isDataFileChanged(byte[] bytes) {
        String md5 = DigestUtils.md5DigestAsHex(bytes);
        if (!previousFilesChecksums.contains(md5)) {
            previousFilesChecksums.add(md5);
            return true;
        }
        return false;
    }

    private void downloadFullCompanyData() {
        downloadData();
    }


    public void importCompanyData(Reader file, int rowColumnCount) {

        List<Company> companiesToSave = Collections.synchronizedList(new ArrayList<>());
        List<String[]> lineData = csvParser.getDataLines(file);
        saveUniqueCompanyTypes(getUniqueCompanyTypes(lineData));
        List<CompanyType> companyTypeList = companyTypeRepository.findAll();

        lineData.parallelStream().forEach(line -> {
            CompanyType companyType = getCompanyType(companyTypeList, line[9]);
            companiesToSave.add(getCompanyData(Arrays.asList(line), rowColumnCount, companyType));

            if (companiesToSave.size() >= 100) {
                synchronized (companiesToSave) {
                    companyRepository.saveAll(companiesToSave);
                    companiesToSave.clear();
                }
            }
        });

        if (!companiesToSave.isEmpty()) {
            companyRepository.saveAll(companiesToSave);
        }
    }

    public CompanyType getCompanyType(List<CompanyType> companyTypeList, String code) {
        return companyTypeList.stream().filter(companyType -> companyType.getCode().equals(code)).findFirst().orElse(null);
    }

    public void saveUniqueCompanyTypes(Set<Map.Entry<String, String>> uniqueCompanyTypes) {
        uniqueCompanyTypes.forEach(entry -> {
            String code = entry.getKey();
            String name = entry.getValue();
            CompanyType existingType = companyTypeRepository.findByCode(code).orElse(null);
            if (existingType == null) {
                CompanyType newType = new CompanyType();
                newType.setCode(code);
                newType.setName(name);
                companyTypeRepository.save(newType);
            }
        });
    }
}

