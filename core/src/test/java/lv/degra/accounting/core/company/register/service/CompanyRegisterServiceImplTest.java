package lv.degra.accounting.core.company.register.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.jdbc.core.JdbcTemplate;

import lv.degra.accounting.core.company.type.model.CompanyType;
import lv.degra.accounting.core.company.type.model.CompanyTypeRepository;
import lv.degra.accounting.core.system.configuration.DegraConfig;
import lv.degra.accounting.core.system.configuration.service.ConfigService;
import lv.degra.accounting.core.system.files.FileService;

import java.io.Reader;
import java.io.StringReader;
import java.util.*;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.*;

class CompanyRegisterServiceImplTest {

    @Mock
    private FileService fileService;
    @Mock
    private CsvParser csvParser;
    @Mock
    private CompanyTypeRepository companyTypeRepository;
    @Mock
    private ConfigService configService;
    @Mock
    private JdbcTemplate jdbcTemplate;

    private CompanyRegisterServiceImpl companyRegisterService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        companyRegisterService = new CompanyRegisterServiceImpl(
                fileService, csvParser, companyTypeRepository, configService, jdbcTemplate);
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
    void testImportCompanyData() {

        String csvContent = "40003000001,LV40003000001,COMPANY NAME,,,,,SIA,SIA,01.01.2000,";
        Reader reader = new StringReader(csvContent);
        List<String[]> mockLineData = Arrays.asList(new String[][]{csvContent.split(",")});


        when(csvParser.getDataLines(any(Reader.class))).thenReturn(mockLineData);
        when(companyTypeRepository.findAll()).thenReturn(Arrays.asList(new CompanyType(1, "SIA", "Sabiedrība ar ierobežotu atbildību")));

        // Act
        companyRegisterService.importCompanyData(reader);

        // Assert
        verify(companyTypeRepository).findAll();
        verify(jdbcTemplate).execute("TRUNCATE TABLE company_register");
        verify(jdbcTemplate).batchUpdate(anyString(), any(org.springframework.jdbc.core.BatchPreparedStatementSetter.class));
    }

    @Test
    void testGetUniqueCompanyTypes() {
        // Arrange
        List<String[]> mockLineData = Arrays.asList(
                new String[]{"40003000001", "LV40003000001", "COMPANY1", "", "", "", "", "", "","SIA", "SIA", "01.01.2000", ""},
                new String[]{"40003000002", "LV40003000002", "COMPANY2", "", "", "", "", "", "","SIA", "SIA", "01.01.2000", ""}
        );

        // Act
        var result = companyRegisterService.getUniqueCompanyTypes(mockLineData);

        // Assert
        assertEquals(1, result.size());
        assertTrue(result.stream().anyMatch(entry -> entry.getKey().equals("SIA") && entry.getValue().equals("SIA")));
    }

    @Test
    void testSaveUniqueCompanyTypes() {
        // Arrange
        var uniqueTypes = Set.of(
                Map.entry("SIA", "Sabiedrība ar ierobežotu atbildību"),
                Map.entry("AS", "Akciju sabiedrība")
        );

        when(companyTypeRepository.getByCode("SIA")).thenReturn(Optional.empty());
        when(companyTypeRepository.getByCode("AS")).thenReturn(Optional.of(new CompanyType()));

        // Act
        companyRegisterService.saveUniqueCompanyTypes(uniqueTypes);

        // Assert
        verify(companyTypeRepository, times(1)).save(any(CompanyType.class));
        verify(companyTypeRepository, times(2)).getByCode(anyString());
    }

    // Add more tests for other methods as needed
}