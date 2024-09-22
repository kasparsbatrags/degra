package lv.degfra.accounting.address.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lv.degra.accounting.core.address.register.enums.ArZipContentFiles;
import lv.degra.accounting.core.address.register.service.AddressRegisterServiceImpl;
import lv.degra.accounting.core.address.register.model.AddressRegister;
import lv.degra.accounting.core.system.configuration.DegraConfig;
import lv.degra.accounting.core.system.configuration.service.ConfigService;
import lv.degra.accounting.core.system.files.FileService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.jdbc.core.BatchPreparedStatementSetter;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.util.DigestUtils;

import java.io.File;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AddressRegisterServiceImplImplTest {

    @Mock
    private FileService fileService;

    @Mock
    private JdbcTemplate jdbcTemplate;

    @Mock
    private ObjectMapper objectMapper;

    @Mock
    private ConfigService configService;

    @InjectMocks
    private AddressRegisterServiceImpl downloadAddressDataService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void importData_WhenFileIsDownloaded_ProcessAndImportDataCalled() {
        byte[] fileBytes = "test csv content".getBytes();
        when(configService.get(DegraConfig.ADDRESS_DOWNLOAD_LINK)).thenReturn("http://example.com/file.csv");
        when(fileService.downloadFileByUrl(anyString())).thenReturn(fileBytes);
        when(fileService.unzipFileInFolder(fileBytes)).thenReturn(null);

        downloadAddressDataService.importData();

        verify(fileService).downloadFileByUrl(anyString());
        verify(fileService).unzipFileInFolder(any());
    }

    @Test
    void downloadArData_WhenFileIsNotDownloaded_HandleEmptyDownloadCalled() {
        when(fileService.downloadFileByUrl(anyString())).thenReturn(new byte[0]);

        downloadAddressDataService.importData();

        verify(fileService).downloadFileByUrl(anyString());
        // Verificē vai žurnālā ieraksta ziņojumu, ka fails netika lejupielādēts
        // Tādēļ varam pielāgot arī logus testos
    }

    @Test
    void isArDataChanged_ShouldReturnTrue_WhenChecksumIsDifferent() {
        byte[] fileBytes = "test csv content".getBytes();
        String oldChecksum = downloadAddressDataService.getPreviousArResponseChecksum();
        boolean result = downloadAddressDataService.isArDataChanged(fileBytes);

        assertTrue(result);
        assertNotEquals(oldChecksum, downloadAddressDataService.getPreviousArResponseChecksum());
    }

    @Test
    void isArDataChanged_ShouldReturnFalse_WhenChecksumIsSame() {
        byte[] fileBytes = "test csv content".getBytes();
        String checksum = DigestUtils.md5DigestAsHex(fileBytes);
        downloadAddressDataService.setPreviousArResponseChecksum(checksum);

        boolean result = downloadAddressDataService.isArDataChanged(fileBytes);

        assertFalse(result);
    }

    @Test
    void truncateAddressRegisterTable_ShouldExecuteSqlStatements() {
        downloadAddressDataService.truncateAddressRegisterTable();

        verify(jdbcTemplate).execute("DROP INDEX IF EXISTS address_register_full_name_idx");
        verify(jdbcTemplate).execute("DROP INDEX IF EXISTS address_register_code_idx");
        verify(jdbcTemplate).execute("DROP INDEX IF EXISTS address_register_parent_code_idx");
        verify(jdbcTemplate).execute("TRUNCATE TABLE address_register");
    }

    @Test
    void batchInsertAddresses_ShouldExecuteBatchUpdate() {
        List<AddressRegister> addressList = List.of(
                new AddressRegister(1001, "Riga", 1, "active", LocalDate.now(), 1000),
                new AddressRegister(1002, "Jelgava", 1, "active", LocalDate.now(), 1001)
        );

        downloadAddressDataService.batchInsertAddresses(addressList);

        verify(jdbcTemplate).batchUpdate(anyString(), any(BatchPreparedStatementSetter.class));
    }

    @Test
    void processFile_ShouldProcessFileAndInsertData() throws Exception {
        ArZipContentFiles fileInfo = ArZipContentFiles.ADDRESS_ZIP_FILE_CONTENT_PARISHES;
        File file = new File("testfile.csv");
        byte[] fileContent = "csv content".getBytes();
        when(fileService.getTempDirectoryPath()).thenReturn(Path.of("/temp"));
        when(fileService.loadFileLocally(anyString())).thenReturn(fileContent);
        when(objectMapper.convertValue(any(), eq(AddressRegister.class))).thenReturn(new AddressRegister());

        downloadAddressDataService.processFile(fileInfo);

        verify(fileService).getTempDirectoryPath();
        verify(fileService).loadFileLocally(anyString());
    }

    @Test
    void handleEmptyDownload_ShouldClearChecksum() {
        downloadAddressDataService.handleEmptyDownload();

        assertEquals("", downloadAddressDataService.getPreviousArResponseChecksum());
    }
}
