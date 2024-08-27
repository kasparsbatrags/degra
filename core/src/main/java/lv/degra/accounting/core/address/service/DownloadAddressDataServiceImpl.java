package lv.degra.accounting.core.address.service;

import static lv.degra.accounting.core.address.enums.ArRecordStatus.getStatusOnSystemByCode;
import static lv.degra.accounting.core.system.configuration.DegraConfig.ADDRESS_DOWNLOAD_LINK;

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
import org.springframework.jdbc.core.BatchPreparedStatementSetter;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.opencsv.bean.CsvToBeanBuilder;

import lombok.extern.slf4j.Slf4j;
import lv.degra.accounting.core.address.enums.ArRecordStatus;
import lv.degra.accounting.core.address.enums.ArZipContentFiles;
import lv.degra.accounting.core.address.exception.DownloadAddressDataException;
import lv.degra.accounting.core.address.exception.ExtractZipFileException;
import lv.degra.accounting.core.address.exception.ReadArCsvFileContentException;
import lv.degra.accounting.core.address.model.Address;
import lv.degra.accounting.core.address.model.AddressData;
import lv.degra.accounting.core.system.configuration.service.ConfigService;
import lv.degra.accounting.core.system.files.FileService;

@Service
@Slf4j
public class DownloadAddressDataServiceImpl implements DownloadAddressDataService {

	public static final char CSV_DATA_SEPARATOR = ';';
	public static final char DOUBLE_QUOTES = '#';
	public static final Integer STATE_CODE = 100000000;
	public static final String STATE_NAME = "Latvija";
	public static final Integer STATE_TYPE = 101;

	private final FileService fileService;
	private final JdbcTemplate jdbcTemplate;
	private final ObjectMapper objectMapper;
	private final ConfigService configService;
	private String previousArResponseChecksum = "";

	@Autowired
	public DownloadAddressDataServiceImpl(FileService fileService, JdbcTemplate jdbcTemplate, ObjectMapper objectMapper,
			ConfigService configService) {
		this.fileService = fileService;
		this.jdbcTemplate = jdbcTemplate;
		this.objectMapper = objectMapper;
		this.configService = configService;
	}

	@Scheduled(cron = "${application.address-download-cron}")
	private void scheduleTaskUsingCronExpression() {
		try {
			downloadArData();
		} catch (ExtractZipFileException e) {
			throw new DownloadAddressDataException(e.getMessage());
		}
	}

	public void downloadArData() {
		log.info("Address data import started");
		byte[] csvFileBytes = fileService.downloadFileByUrl(configService.get(ADDRESS_DOWNLOAD_LINK), "");

		if (csvFileBytes == null || csvFileBytes.length == 0) {
			handleEmptyDownload();
			return;
		}

		if (isArDataChanged(csvFileBytes)) {
			processAndImportData(csvFileBytes);
		} else {
			log.info("Address CSV file not changed");
		}

		log.info("Address data import finished");
	}

	private void handleEmptyDownload() {
		previousArResponseChecksum = "";
		log.info("Address CSV file unable to download");
	}

	private void processAndImportData(byte[] csvFileBytes) {
		try {
			fileService.unzipFileInFolder(csvFileBytes);
		} catch (Exception e) {
			throw new ExtractZipFileException(e.getMessage());
		}

		truncateAddressTable();
		importState();
		importArData();
		createIndexes();
		fileService.deleteDirectory(fileService.getTempDirectoryPath().toAbsolutePath());
	}

	private void truncateAddressTable() {
		jdbcTemplate.execute("DROP INDEX IF EXISTS address_full_name_idx");
		jdbcTemplate.execute("DROP INDEX IF EXISTS address_code_idx");
		jdbcTemplate.execute("DROP INDEX IF EXISTS address_parent_code_idx");
		jdbcTemplate.execute("TRUNCATE TABLE address");
	}

	private void createIndexes() {
		jdbcTemplate.execute("CREATE INDEX address_code_idx ON address (code)");
		jdbcTemplate.execute("CREATE INDEX address_parent_code_idx ON address (parent_code)");
		jdbcTemplate.execute("CREATE INDEX address_full_name_idx ON address (full_name)");
	}

	private void importArData() {
		Arrays.stream(ArZipContentFiles.values()).forEach(this::processFile);
	}

	private void processFile(ArZipContentFiles fileInfo) {
		File archiveFile = new File(fileService.getTempDirectoryPath() + FileSystems.getDefault().getSeparator() + fileInfo.getFileName());
		byte[] fileContent = getFileContent(archiveFile);

		List<AddressData> csvData = parseCsvArDataFileToList(new InputStreamReader(new ByteArrayInputStream(fileContent)),
				fileInfo.getClasName());
		List<Address> addressList = mapCsvDataToAddressList(csvData);

		batchInsertAddresses(addressList);
	}

	private byte[] getFileContent(File archiveFile) {
		if (!archiveFile.exists()) {
			throw new ReadArCsvFileContentException("Unable to get file: " + archiveFile.getAbsolutePath());
		}
		return fileService.loadFileLocally(archiveFile.getAbsolutePath());
	}

	private List<Address> mapCsvDataToAddressList(List<AddressData> csvData) {
		return csvData.parallelStream().map(row -> objectMapper.convertValue(row, Address.class))
				.filter(address -> !ArRecordStatus.STATUS_ERROR.getCode().equals(address.getStatus())).toList();
	}

	private void importState() {
		List<Address> addressList = List.of(getState());
		batchInsertAddresses(addressList);
	}

	private Address getState() {
		return new Address(STATE_CODE, STATE_NAME, STATE_TYPE, ArRecordStatus.EXIST.getCode(), LocalDate.now());
	}

	private List<AddressData> parseCsvArDataFileToList(Reader reader, Class<? extends AddressData> clasName) {
		return new CsvToBeanBuilder<AddressData>(reader).withType(clasName).withSkipLines(1).withSeparator(CSV_DATA_SEPARATOR)
				.withQuoteChar(DOUBLE_QUOTES).build().parse();
	}

	private boolean isArDataChanged(byte[] bytes) {
		String md5 = DigestUtils.md5DigestAsHex(bytes);
		boolean hasChanged = !previousArResponseChecksum.equals(md5);
		if (hasChanged) {
			previousArResponseChecksum = md5;
		}
		return hasChanged;
	}

	public void batchInsertAddresses(List<Address> addressList) {
		String sql = """
				INSERT INTO address
				(code, "type", status, parent_code, parent_type, "name", sort_by_value, zip, date_from, date_to, update_date_public, full_name, territorial_unit_code)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
				""";

		jdbcTemplate.batchUpdate(sql, new BatchPreparedStatementSetter() {
			@Override
			public void setValues(PreparedStatement ps, int i) throws SQLException {
				Address address = addressList.get(i);
				ps.setInt(1, address.getCode());
				ps.setObject(2, address.getType(), Types.INTEGER);
				ps.setInt(3, getStatusOnSystemByCode(address.getStatus()));
				ps.setInt(4, address.getParentCode());
				ps.setInt(5, address.getParentType());
				ps.setString(6, address.getName());
				ps.setString(7, address.getSortByValue());
				ps.setString(8, address.getZip());
				ps.setDate(9, Date.valueOf(address.getDateFrom()));
				ps.setDate(10, address.getDateTo() != null ? Date.valueOf(address.getDateTo()) : null);
				ps.setDate(11, Date.valueOf(address.getUpdateDatePublic()));
				ps.setString(12, address.getFullName());
				ps.setObject(13, address.getTerritorialUnitCode(), Types.INTEGER);
			}

			@Override
			public int getBatchSize() {
				return addressList.size();
			}
		});
	}
}
