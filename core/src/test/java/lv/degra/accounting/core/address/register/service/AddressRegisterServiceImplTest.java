package lv.degra.accounting.core.address.register.service;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.jdbc.core.JdbcTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;

import lv.degra.accounting.core.address.register.enums.ArZipContentFiles;
import lv.degra.accounting.core.address.register.exception.ReadArCsvFileContentException;
import lv.degra.accounting.core.address.register.model.AddressRegister;
import lv.degra.accounting.core.address.register.model.AddressRegisterRepository;
import lv.degra.accounting.core.system.configuration.DegraConfig;
import lv.degra.accounting.core.system.configuration.service.ConfigService;
import lv.degra.accounting.core.system.files.FileService;

class AddressRegisterServiceImplTest {

	private static final String TEST_ZIP_FILE_PATH = "src/test/resources/aw_csv.zip";
	private static final String DOWNLOAD_FILE_URL = "http://example.com/address-data.zip";

	@InjectMocks
	private AddressRegisterServiceImpl service;

	@Mock
	private AddressRegisterRepository repository;

	@Mock
	private FileService fileService;

	@Mock
	private JdbcTemplate jdbcTemplate;

	@Mock
	private ObjectMapper objectMapper;

	@Mock
	private ConfigService configService;

	@BeforeEach
	void setUp() {
		MockitoAnnotations.openMocks(this);
	}

	@Test
	void testDownloadCsvFile_Success() throws IOException {
		byte[] expectedFileBytes = Files.readAllBytes(Path.of(TEST_ZIP_FILE_PATH));


		when(configService.get(DegraConfig.ADDRESS_DOWNLOAD_LINK)).thenReturn(DOWNLOAD_FILE_URL);
		when(fileService.downloadFileByUrl(DOWNLOAD_FILE_URL)).thenReturn(expectedFileBytes);

		byte[] result = service.downloadCsvFile();

		assertNotNull(result);
		assertArrayEquals(expectedFileBytes, result);
		verify(fileService).downloadFileByUrl(DOWNLOAD_FILE_URL);
	}

	@Test
	void testDownloadCsvFile_NoData() {

		when(configService.get(DegraConfig.ADDRESS_DOWNLOAD_LINK)).thenReturn(DOWNLOAD_FILE_URL);
		when(fileService.downloadFileByUrl(DOWNLOAD_FILE_URL)).thenReturn(null);

		byte[] result = service.downloadCsvFile();

		assertNull(result);
		verify(fileService).downloadFileByUrl(DOWNLOAD_FILE_URL);
	}

	@Test
	void testProcessFile_InvalidCsv() {
		ArZipContentFiles fileInfo = mock(ArZipContentFiles.class);
		when(fileInfo.getFileName()).thenReturn("invalid.csv");
		when(fileInfo.getClasName()).thenAnswer(invocation -> AddressRegister.class);

		byte[] mockFileContent = "invalid_data".getBytes();
		when(fileService.loadFileLocally(anyString())).thenReturn(mockFileContent);

		assertThrows(ReadArCsvFileContentException.class, () -> service.processFile(fileInfo));
	}

	@Test
	void testIsArDataChanged() {
		byte[] oldChecksum = "oldChecksum".getBytes();
		service.setPreviousArResponseChecksum(oldChecksum);

		byte[] newFileBytes = "newFileContent".getBytes();
		boolean result = service.isArDataChanged(newFileBytes);

		assertTrue(result);
		assertNotEquals(oldChecksum, service.getPreviousArResponseChecksum());
	}
}
