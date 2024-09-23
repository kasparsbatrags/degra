package lv.degra.accounting.core.address.register.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.jdbc.core.JdbcTemplate;

import lv.degra.accounting.core.address.register.model.AddressRegisterRepository;
import lv.degra.accounting.core.system.configuration.DegraConfig;
import lv.degra.accounting.core.system.configuration.service.ConfigService;
import lv.degra.accounting.core.system.files.FileService;

import com.fasterxml.jackson.databind.ObjectMapper;

import static org.mockito.Mockito.*;

class AddressRegisterServiceImplTest {

    @Mock
    private AddressRegisterRepository addressRegisterRepository;

    @Mock
    private FileService fileService;

    @Mock
    private JdbcTemplate jdbcTemplate;

    @Mock
    private ObjectMapper objectMapper;

    @Mock
    private ConfigService configService;

    @InjectMocks
    private AddressRegisterServiceImpl addressRegisterService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testImportData_WhenNewDataAvailable() {
        // Arrange
        byte[] mockCsvFileBytes = "mock csv data".getBytes();
        when(configService.get(DegraConfig.ADDRESS_DOWNLOAD_LINK)).thenReturn("http://mock-url.com");
        when(fileService.downloadFileByUrl(anyString())).thenReturn(mockCsvFileBytes);
        doReturn(true).when(addressRegisterService).isArDataChanged(mockCsvFileBytes);

        // Act
        addressRegisterService.importData();

        // Assert
        verify(fileService).unzipFileInFolder(mockCsvFileBytes);
        verify(jdbcTemplate, times(3)).execute(anyString()); // For dropping indexes and truncating
        verify(fileService).deleteDirectory(any());
    }

    @Test
    void testImportData_WhenNoNewData() {
        // Arrange
        byte[] mockCsvFileBytes = "mock csv data".getBytes();
        when(configService.get(DegraConfig.ADDRESS_DOWNLOAD_LINK)).thenReturn("http://mock-url.com");
        when(fileService.downloadFileByUrl(anyString())).thenReturn(mockCsvFileBytes);
        doReturn(false).when(addressRegisterService).isArDataChanged(mockCsvFileBytes);

        // Act
        addressRegisterService.importData();

        // Assert
        verify(fileService, never()).unzipFileInFolder(any());
        verify(jdbcTemplate, never()).execute(anyString());
        verify(fileService, never()).deleteDirectory(any());
    }

    @Test
    void testImportData_WhenDownloadFails() {
        // Arrange
        when(configService.get(DegraConfig.ADDRESS_DOWNLOAD_LINK)).thenReturn("http://mock-url.com");
        when(fileService.downloadFileByUrl(anyString())).thenReturn(null);

        // Act
        addressRegisterService.importData();

        // Assert
        verify(addressRegisterService).handleEmptyDownload();
        verify(fileService, never()).unzipFileInFolder(any());
        verify(jdbcTemplate, never()).execute(anyString());
        verify(fileService, never()).deleteDirectory(any());
    }
}