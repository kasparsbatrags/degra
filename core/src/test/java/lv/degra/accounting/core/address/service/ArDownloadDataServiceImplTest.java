package lv.degra.accounting.core.address.service;

import static lv.degra.accounting.core.system.configuration.DegraConfig.ADDRESS_DOWNLOAD_LINK;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;

import lv.degra.accounting.core.system.configuration.service.ConfigService;
import lv.degra.accounting.core.system.files.FileService;

class ArDownloadDataServiceImplTest {

	@Mock
	private FileService fileService;

	@Mock
	private ConfigService configService;

	@InjectMocks
	private DownloadAddressDataService downloadAddressDataService;

	@BeforeEach
	public void setUp() {
		configService = Mockito.mock(ConfigService.class);
		fileService = Mockito.mock(FileService.class);
		downloadAddressDataService = Mockito.mock(DownloadAddressDataService.class);
	}

	@Test
	void testDownloadArData() {
		String expectedUrl = "https://example.com/data.zip";
		byte[] testData = new byte[] { 1, 2, 3, 4, 5 };
		when(configService.get(ADDRESS_DOWNLOAD_LINK)).thenReturn(expectedUrl);
		when(fileService.downloadFileByUrl(expectedUrl, "")).thenReturn(testData);
		downloadAddressDataService.downloadArData();
	}
}