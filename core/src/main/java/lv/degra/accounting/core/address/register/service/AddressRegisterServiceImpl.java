package lv.degra.accounting.core.address.register.service;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.file.FileSystems;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Types;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.jdbc.core.BatchPreparedStatementSetter;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.opencsv.bean.CsvToBeanBuilder;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import lv.degra.accounting.core.address.register.enums.ArRecordStatus;
import lv.degra.accounting.core.address.register.enums.ArZipContentFiles;
import lv.degra.accounting.core.address.register.exception.ReadArCsvFileContentException;
import lv.degra.accounting.core.address.register.model.AddressData;
import lv.degra.accounting.core.address.register.model.AddressRegister;
import lv.degra.accounting.core.address.register.model.AddressRegisterRepository;
import lv.degra.accounting.core.system.configuration.DegraConfig;
import lv.degra.accounting.core.system.configuration.service.ConfigService;
import lv.degra.accounting.core.system.files.FileService;
import lv.degra.accounting.core.system.files.exception.ExtractZipFileException;


@Service
@Slf4j
public class AddressRegisterServiceImpl implements AddressRegisterService {

    public static final char CSV_DATA_SEPARATOR = ';';
    public static final char DOUBLE_QUOTES = '#';
    private final AddressRegisterRepository addressRegisterRepository;
    private final FileService fileService;
    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;
    private final ConfigService configService;
    @Getter
    @Setter
    private String previousArResponseChecksum = "";

    @Autowired
    public AddressRegisterServiceImpl(AddressRegisterRepository addressRegisterRepository, FileService fileService, JdbcTemplate jdbcTemplate, ObjectMapper objectMapper,
                                      ConfigService configService) {
        this.addressRegisterRepository = addressRegisterRepository;
        this.fileService = fileService;
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = objectMapper;
        this.configService = configService;
    }

    @Cacheable("addressRegsiterCache")
    public List<AddressRegister> getByMultipleWords(String searchString) {
        return addressRegisterRepository.searchByMultipleWords(searchString);
    }

    public void importData() {
        log.info("Address data import started");
        byte[] csvFileBytes = fileService.downloadFileByUrl(configService.get(DegraConfig.ADDRESS_DOWNLOAD_LINK));

        if (csvFileBytes == null || csvFileBytes.length == 0) {
            handleEmptyDownload();
            return;
        }

        if (isArDataChanged(csvFileBytes)) {
			try {
				processAndImportData(csvFileBytes);
			} catch (ExtractZipFileException e) {
				throw new RuntimeException(e);
			}
		} else {
            log.info("Address CSV file not changed");
        }

        log.info("Address data import finished");
    }

    public void handleEmptyDownload() {
        previousArResponseChecksum = "";
        log.info("Address CSV file unable to download");
    }

	private void processAndImportData(byte[] csvFileBytes) throws ExtractZipFileException {
		try {
			fileService.unzipFileInFolder(csvFileBytes);
		} catch (Exception e) {
			log.error("Error unzipping file", e);
			throw new ExtractZipFileException(e.getMessage() + e.getCause());
		}

		truncateAddressRegisterTable();
		importArData();
		createIndexes();
		fileService.deleteDirectory(fileService.getTempDirectoryPath().toAbsolutePath());
	}
    public void truncateAddressRegisterTable() {
        jdbcTemplate.execute("DROP INDEX IF EXISTS address_register_full_address_idx");
        jdbcTemplate.execute("DROP INDEX IF EXISTS address_register_code_idx");
        jdbcTemplate.execute("DROP INDEX IF EXISTS address_register_parent_code_idx");
        jdbcTemplate.execute("TRUNCATE TABLE address_register");
    }

    private void createIndexes() {
        jdbcTemplate.execute("CREATE INDEX address_register_code_idx ON address_register (code)");
        jdbcTemplate.execute("CREATE INDEX address_register_parent_code_idx ON address_register (parent_code)");
        jdbcTemplate.execute("CREATE INDEX address_register_full_address_idx ON address_register (full_address)");
    }

    private void importArData() {
        Arrays.stream(ArZipContentFiles.values()).forEach(this::processFile);
    }

    public void processFile(ArZipContentFiles fileInfo) {
        File archiveFile = new File(fileService.getTempDirectoryPath() + FileSystems.getDefault().getSeparator() + fileInfo.getFileName());
        byte[] fileContent = getFileContent(archiveFile);

        try (Reader reader = new InputStreamReader(new ByteArrayInputStream(fileContent))) {
            List<AddressData> csvData = parseCsvArDataFileToList(reader, fileInfo.getClasName());
            List<AddressRegister> addressList = mapCsvDataToAddressList(csvData);
            batchInsertAddresses(addressList);
        } catch (Exception e) {
            log.error("Error processing file: {}", fileInfo.getFileName(), e);
            throw new ReadArCsvFileContentException("Error processing file: " + fileInfo.getFileName() + e.getCause());
        }
    }

    private byte[] getFileContent(File archiveFile) {
        if (!archiveFile.exists()) {
            throw new ReadArCsvFileContentException("Unable to get file: " + archiveFile.getAbsolutePath());
        }
        return fileService.loadFileLocally(archiveFile.getAbsolutePath());
    }

    private List<AddressRegister> mapCsvDataToAddressList(List<AddressData> csvData) {
        return csvData.parallelStream()
                .map(row -> objectMapper.convertValue(row, AddressRegister.class))
                .filter(address -> !ArRecordStatus.STATUS_ERROR.getCode().equals(address.getStatus()))
                .toList();
    }

    private List<AddressData> parseCsvArDataFileToList(Reader reader, Class<? extends AddressData> clasName) {
        return new CsvToBeanBuilder<AddressData>(reader)
                .withType(clasName)
                .withSkipLines(1)
                .withSeparator(CSV_DATA_SEPARATOR)
                .withQuoteChar(DOUBLE_QUOTES)
                .build()
                .parse();
    }

    public boolean isArDataChanged(byte[] bytes) {
        String md5 = DigestUtils.md5DigestAsHex(bytes);
        boolean hasChanged = !previousArResponseChecksum.equals(md5);
        if (hasChanged) {
            previousArResponseChecksum = md5;
        }
        return hasChanged;
    }

    public void batchInsertAddresses(List<AddressRegister> addressList) {
        String sql = """
                INSERT INTO address_register
                (code, "type", status, parent_code, parent_type, "name", sort_name, zip, date_from, date_to, update_date_public, full_address, territorial_unit_code)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                """;

        jdbcTemplate.batchUpdate(sql, new BatchPreparedStatementSetter() {
            @Override
            public void setValues(@NotNull PreparedStatement ps, int i) throws SQLException {
                AddressRegister address = addressList.get(i);
                ps.setInt(1, address.getCode());
                ps.setObject(2, address.getType(), Types.INTEGER);
                ps.setInt(3, ArRecordStatus.getStatusOnSystemByCode(address.getStatus()));
                ps.setInt(4, address.getParentCode());
                ps.setInt(5, address.getParentType() != null ? address.getParentType() : 0);
                ps.setString(6, address.getName());
                ps.setString(7, address.getSortName());
                ps.setString(8, address.getZip());
                ps.setDate(9, Date.valueOf(address.getDateFrom()));
                ps.setDate(10, address.getDateTo() != null ? Date.valueOf(address.getDateTo()) : null);
                ps.setDate(11, Date.valueOf(address.getUpdateDatePublic() != null ? address.getUpdateDatePublic() : LocalDate.now()));
                ps.setString(12, address.getFullAddress());
                ps.setObject(13, address.getTerritorialUnitCode(), Types.INTEGER);
            }

            @Override
            public int getBatchSize() {
                return addressList.size();
            }
        });
    }
}
