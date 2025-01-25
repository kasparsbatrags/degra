package lv.degra.accounting.core.company.register.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.Reader;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.jdbc.core.BatchPreparedStatementSetter;
import org.springframework.jdbc.core.JdbcTemplate;

import lv.degra.accounting.core.company.register.model.CompanyRegister;
import lv.degra.accounting.core.company.register.model.CompanyRegisterRepository;
import lv.degra.accounting.core.company.type.model.CompanyType;
import lv.degra.accounting.core.company.type.model.CompanyTypeRepository;
import lv.degra.accounting.core.system.configuration.DegraConfig;
import lv.degra.accounting.core.system.configuration.service.ConfigService;
import lv.degra.accounting.core.system.files.FileService;

class CompanyRegisterImportServiceImplTest {

	@Mock
	private FileService fileService;
	@Mock
	private CsvParser csvParser;
	@Mock
	private CompanyTypeRepository companyTypeRepository;
	@Mock
	private CompanyRegisterRepository companyRegisterRepository;
	@Mock
	private ConfigService configService;
	@Mock
	private JdbcTemplate jdbcTemplate;

	private CompanyRegisterImportServiceImpl companyRegisterService;

	@BeforeEach
	void setUp() {
		MockitoAnnotations.openMocks(this);
		companyRegisterService = new CompanyRegisterImportServiceImpl(fileService, csvParser, companyTypeRepository, configService, jdbcTemplate,
				companyRegisterRepository);
	}

	@Test
	void testImportData() {
		// Arrange
		byte[] mockCsvData = "mock,csv,data".getBytes();
		when(configService.get(DegraConfig.COMPANY_DOWNLOAD_LINK)).thenReturn("http://mock-url.com");
		when(fileService.downloadFileByUrl(anyString())).thenReturn(mockCsvData);

		// Act
		companyRegisterService.importData();

		// Assert
		verify(fileService).downloadFileByUrl("http://mock-url.com");
		// Add more verifications as needed
	}

	@Test
	void testGetUniqueCompanyTypes() {
		// Arrange
		List<String[]> mockLineData = Arrays.asList(
				new String[] { "41202013815", "LV53ZZZ41202013815", "IK KRASTNIEKI A I", "IK", "KRASTNIEKI A I", "", "0", "K",
						"Komercreģistrs", "IK", "Individuālais komersants", "1998-02-26", "2014-04-10", "L",
						"Dundagas nov., Kolkas pag., Kolka, Krastnieki", "3275", "103045133", "100015821", "0", "0885162", "" },
				new String[] { "41202013816", "LV53ZZZ41202013816", "IK KRASTNIEKI A I", "IK", "KRASTNIEKI A I", "", "0", "K",
						"Komercreģistrs", "SIA", "Sabiedrība ar ierobežotu atbildību", "1998-02-26", "2014-04-10", "L",
						"Dundagas nov., Kolkas pag., Kolka, Krastnieki", "3275", "103045133", "100015821", "0", "0885162", "" },
				new String[] { "41202013815", "LV53ZZZ41202013815", "IK KRASTNIEKI A I", "IK", "KRASTNIEKI A I", "", "0", "K",
						"Komercreģistrs", "IK", "Individuālais komersants", "1998-02-26", "2014-04-10", "L",
						"Dundagas nov., Kolkas pag., Kolka, Krastnieki", "3275", "103045133", "100015821", "0", "0885162", "" });

		// Act
		var result = companyRegisterService.getUniqueCompanyTypes(mockLineData);

		// Assert
		assertEquals(2, result.size());
		assertTrue(result.stream().anyMatch(entry -> entry.getKey().equals("IK") && entry.getValue().equals("Individuālais komersants")));
	}

	@Test
	void testSaveUniqueCompanyTypes() {
		// Arrange
		var uniqueTypes = Set.of(Map.entry("SIA", "Sabiedrība ar ierobežotu atbildību"), Map.entry("AS", "Akciju sabiedrība"));

		when(companyTypeRepository.getByCode("SIA")).thenReturn(Optional.empty());
		when(companyTypeRepository.getByCode("AS")).thenReturn(Optional.of(new CompanyType()));

		// Act
		companyRegisterService.saveUniqueCompanyTypes(uniqueTypes);

		// Assert
		verify(companyTypeRepository, times(1)).save(any(CompanyType.class));
		verify(companyTypeRepository, times(2)).getByCode(anyString());
	}

	@Test
	public void testImportData_FileDownloadedAndProcessed() {
		// Mocking dependencies
		byte[] csvData = "register_number;sepa_code;name\n12345;SEP001;Company A".getBytes();
		when(configService.get(DegraConfig.COMPANY_DOWNLOAD_LINK)).thenReturn("http://example.com/file.csv");
		when(fileService.downloadFileByUrl(anyString())).thenReturn(csvData);

		// Call method
		companyRegisterService.importData();

		// Verify interactions
		verify(fileService).downloadFileByUrl(anyString());
		verify(csvParser).getDataLines(any(Reader.class));
	}

	@Test
	public void testImportData_FileNotDownloaded() {
		// Mocking dependencies
		when(configService.get(DegraConfig.COMPANY_DOWNLOAD_LINK)).thenReturn("http://example.com/file.csv");
		when(fileService.downloadFileByUrl(anyString())).thenReturn(null);

		// Call method
		companyRegisterService.importData();

		// Verify that CSV parser is never called
		verify(csvParser, never()).getDataLines(any(Reader.class));
	}

	@Test
	public void testBatchInsertCompanyRegister() {
		// Prepare data
		CompanyType companyType = new CompanyType();
		companyType.setId(1);
		companyType.setCode("LLC");
		companyType.setName("Limited Liability Company");

		CompanyRegister companyRegister = new CompanyRegister();
		companyRegister.setRegisterNumber("12345");
		companyRegister.setSepaCode("SEP001");
		companyRegister.setName("Company A");
		companyRegister.setCompanyType(companyType);
		companyRegister.setRegisteredDate(LocalDate.now());
		companyRegister.setTerminatedDate(null);

		List<CompanyRegister> companyRegisterList = List.of(companyRegister);

		// Call method
		companyRegisterService.batchInsertCompanyRegister(companyRegisterList);

		// Verify interactions
		verify(jdbcTemplate).batchUpdate(anyString(), any(BatchPreparedStatementSetter.class));
	}

	@Test
	public void testTruncateCompanyRegisterTable() {
		// Call method
		companyRegisterService.truncateCompanyRegisterTable();

		// Verify interaction
		verify(jdbcTemplate).execute("TRUNCATE TABLE company_register");
	}

	@Test
	public void testGetBatchSize() {
		// Prepare data
		List<CompanyRegister> companyRegisterList = List.of(
				new CompanyRegister(), new CompanyRegister(), new CompanyRegister()
		);

		// Create a BatchPreparedStatementSetter instance
		BatchPreparedStatementSetter batchPreparedStatementSetter = new BatchPreparedStatementSetter() {
			@Override
			public void setValues(PreparedStatement ps, int i) throws SQLException {
				// Implementation not required for this test
			}

			@Override
			public int getBatchSize() {
				return companyRegisterList.size();
			}
		};

		// Verify batch size
		assertEquals(3, batchPreparedStatementSetter.getBatchSize(), "Expected batch size to be 3");
	}

	@Test
	public void testGetCompanyData() {
		// Prepare data
		List<String> csvLineInArray = List.of("12345", "SEP001", "Company A", "Company A Before Quotes", "Company A In Quotes", "Company A After Quotes", "", "", "", "LLC", "Limited Liability Company", "2023-01-01", "2023-12-31");
		CompanyType companyType = new CompanyType();
		companyType.setId(1);
		companyType.setCode("LLC");
		companyType.setName("Limited Liability Company");

		// Call method
		CompanyRegister companyRegister = companyRegisterService.getCompanyData(csvLineInArray, companyType);

		// Verify result
		assertEquals("12345", companyRegister.getRegisterNumber());
		assertEquals("SEP001", companyRegister.getSepaCode());
		assertEquals("Company A In Quotes, LLC", companyRegister.getName());
		assertEquals("Company A Before Quotes", companyRegister.getNameBeforeQuotes());
		assertEquals("Company A In Quotes", companyRegister.getNameInQuotes());
		assertEquals("Company A After Quotes", companyRegister.getNameAfterQuotes());
		assertEquals(companyType, companyRegister.getCompanyType());
		assertEquals(LocalDate.parse("2023-01-01"), companyRegister.getRegisteredDate());
		assertEquals(LocalDate.parse("2023-12-31"), companyRegister.getTerminatedDate());
	}

	@Test
	void testGetCompaniesLists() {
		// Prepare data
		List<String[]> lineData = List.of(
				new String[]{"12345", "SEP001", "Company A", "", "", "", "", "", "", "LLC", "Limited Liability Company", "2023-01-01", ""},
				new String[]{"67890", "SEP002", "Company B", "", "", "", "", "", "", "PLC", "Public Limited Company", "2023-02-01", ""}
		);

		Map<String, CompanyType> companyTypeMap = new HashMap<>();
		CompanyType llcType = new CompanyType();
		llcType.setId(1);
		llcType.setCode("LLC");
		llcType.setName("Limited Liability Company");
		companyTypeMap.put("LLC", llcType);

		CompanyType plcType = new CompanyType();
		plcType.setId(2);
		plcType.setCode("PLC");
		plcType.setName("Public Limited Company");
		companyTypeMap.put("PLC", plcType);

		// Call method
		List<CompanyRegister> companyRegisterList = companyRegisterService.getCompaniesLists(lineData, companyTypeMap);

		// Verify result
		assertEquals(2, companyRegisterList.size());
		assertEquals("12345", companyRegisterList.get(0).getRegisterNumber());
		assertEquals("67890", companyRegisterList.get(1).getRegisterNumber());
		assertEquals(llcType, companyRegisterList.get(0).getCompanyType());
		assertEquals(plcType, companyRegisterList.get(1).getCompanyType());
	}

	@Test
	void testSetValues() throws SQLException {
		// Prepare data
		CompanyRegister companyRegister = new CompanyRegister();
		companyRegister.setRegisterNumber("12345");
		companyRegister.setSepaCode("SEP001");
		companyRegister.setName("Company A");
		companyRegister.setRegisteredDate(LocalDate.parse("2023-01-01"));
		companyRegister.setTerminatedDate(LocalDate.parse("2023-12-31"));
		List<CompanyRegister> companyRegisterList = List.of(companyRegister);

		// Mock PreparedStatement
		PreparedStatement preparedStatement = mock(PreparedStatement.class);

		// Create a BatchPreparedStatementSetter instance
		BatchPreparedStatementSetter batchPreparedStatementSetter = new BatchPreparedStatementSetter() {
			@Override
			public void setValues(PreparedStatement ps, int i) throws SQLException {
				CompanyRegister company = companyRegisterList.get(i);
				ps.setString(1, company.getRegisterNumber());
				ps.setString(2, company.getSepaCode());
				ps.setString(3, company.getName());
				ps.setDate(4, java.sql.Date.valueOf(company.getRegisteredDate()));
				ps.setDate(5, java.sql.Date.valueOf(company.getTerminatedDate()));
			}

			@Override
			public int getBatchSize() {
				return companyRegisterList.size();
			}
		};

		// Call setValues
		batchPreparedStatementSetter.setValues(preparedStatement, 0);

		// Verify that PreparedStatement methods were called with correct values
		verify(preparedStatement).setString(1, "12345");
		verify(preparedStatement).setString(2, "SEP001");
		verify(preparedStatement).setString(3, "Company A");
		verify(preparedStatement).setDate(4, java.sql.Date.valueOf("2023-01-01"));
		verify(preparedStatement).setDate(5, java.sql.Date.valueOf("2023-12-31"));
	}
}