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
import java.util.ArrayList;
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
		if (csvFileBytes != null && csvFileBytes.length > 0 && isArDataChanged(csvFileBytes)) {
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
		} else if (csvFileBytes != null && csvFileBytes.length > 0 && !isArDataChanged(csvFileBytes)) {
			previousArResponseChecksum = "";
			log.info("Address csv file not changed");
		} else if (csvFileBytes == null || csvFileBytes.length == 0) {
			previousArResponseChecksum = "";
			log.info("Address csv file unable to download");

		}
		log.info("Address data import finished");
	}

	private Address getState() {
		Address stateAddress = new Address();
		stateAddress.setCode(STATE_CODE);
		stateAddress.setParentCode(STATE_CODE);
		stateAddress.setName(STATE_NAME);
		stateAddress.setSortByValue(STATE_NAME);
		stateAddress.setType(STATE_TYPE);
		stateAddress.setParentType(STATE_TYPE);
		stateAddress.setFullName(STATE_NAME);
		stateAddress.setStatus(ArRecordStatus.EXIST.getCode());
		stateAddress.setDateFrom(LocalDate.now());
		stateAddress.setUpdateDatePublic(LocalDate.now());
		return stateAddress;
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
		Arrays.asList(ArZipContentFiles.values()).forEach(fileInfo -> {
			File archiveFile = new File(
					fileService.getTempDirectoryPath() + FileSystems.getDefault().getSeparator() + fileInfo.getFileName());
			byte[] fileContent;
			if (archiveFile.exists()) {
				fileContent = fileService.loadFileLocally(archiveFile.getAbsolutePath());
			} else {
				throw new ReadArCsvFileContentException("Unable to get file:" + archiveFile.getAbsolutePath());
			}

			importFile(new InputStreamReader(new ByteArrayInputStream(fileContent)), fileInfo);

		});

	}

	private void importState() {
		List<Address> addressList = new ArrayList<>();
		addressList.add(getState());
		batchInsertUsers(addressList);
	}

	private void importFile(InputStreamReader file, ArZipContentFiles fileInfo) {
		List<AddressData> csvData = parseCsvArDataFileToList(file, fileInfo.getClasName());
		List<Address> addressList = csvData.parallelStream().map(row -> objectMapper.convertValue(row, Address.class))
				.filter(address -> !ArRecordStatus.STATUS_ERROR.getCode().equals(address.getStatus())).toList();

		batchInsertUsers(addressList);
	}

	private List<AddressData> parseCsvArDataFileToList(Reader reader, Class<? extends AddressData> clasName) {
		return new CsvToBeanBuilder<AddressData>(reader).withType(clasName).withSkipLines(1).withSeparator(CSV_DATA_SEPARATOR)
				.withQuoteChar(DOUBLE_QUOTES).build().parse();
	}

	private boolean isArDataChanged(byte[] bytes) {
		boolean result = false;
		String md5 = DigestUtils.md5DigestAsHex(bytes);
		if (!previousArResponseChecksum.equals(md5)) {
			previousArResponseChecksum = md5;
			result = true;
		}
		return result;
	}

	public void batchInsertUsers(List<Address> addressList) {
		String sql = """
				INSERT INTO address
				(code,
				"type",
				status,
				parent_code,
				parent_type,
				"name",
				sort_by_value,
				zip,
				date_from,
				date_to,
				update_date_public,
				full_name,
				territorial_unit_code)
				VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);""";

		this.jdbcTemplate.batchUpdate(sql, new BatchPreparedStatementSetter() {

			@Override
			public void setValues(PreparedStatement ps, int i) throws SQLException {
				Address address = addressList.get(i);
				ps.setInt(1, address.getCode());
				ps.setInt(2, (address.getType() != null) ? address.getType() : null);
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
				ps.setInt(13, address.getTerritorialUnitCode() != null ? address.getTerritorialUnitCode() : Types.INTEGER);
			}

			@Override
			public int getBatchSize() {
				return addressList.size();
			}
		});
	}

}
