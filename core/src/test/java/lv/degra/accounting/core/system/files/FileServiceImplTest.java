package lv.degra.accounting.core.system.files;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.MockitoAnnotations;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.util.FileSystemUtils;
import org.springframework.web.client.RestTemplate;

import lv.degra.accounting.core.system.files.exception.DeleteFileException;
import lv.degra.accounting.core.system.files.exception.DeleteFolderException;
import lv.degra.accounting.core.system.files.exception.DownloadFileException;
import lv.degra.accounting.core.system.files.exception.ExtractZipFileException;
import lv.degra.accounting.core.system.files.exception.SaveFileException;
import net.lingala.zip4j.ZipFile;
import net.lingala.zip4j.exception.ZipException;

class FileServiceImplTest {

	@Mock
	private RestTemplateBuilder restTemplateBuilder;

	@InjectMocks
	private FileServiceImpl fileService;

	@BeforeEach
	void setUp() {
		MockitoAnnotations.openMocks(this);
	}

	@Test
	void testDownloadFileByUrl_Success() {
		String fileUrl = "http://example.com/file.zip";
		byte[] fileContent = {1, 2, 3};
		RestTemplate restTemplateMock = mock(RestTemplate.class);
		when(restTemplateBuilder.setConnectTimeout(any())).thenReturn(restTemplateBuilder);
		when(restTemplateBuilder.setReadTimeout(any())).thenReturn(restTemplateBuilder);
		when(restTemplateBuilder.build()).thenReturn(restTemplateMock);
		when(restTemplateMock.exchange(eq(fileUrl), eq(HttpMethod.GET), any(HttpEntity.class), eq(byte[].class))).thenReturn(
				ResponseEntity.ok(fileContent));
		byte[] result = fileService.downloadFileByUrl(fileUrl);
		assertArrayEquals(fileContent, result, "Downloaded file content should match expected");
	}

	@Test
	void testDownloadFileByUrl_Failure() {
		String fileUrl = "http://example.com/file.zip";
		when(restTemplateBuilder.build()).thenThrow(new RuntimeException("Connection error"));
		assertThrows(DownloadFileException.class, () -> fileService.downloadFileByUrl(fileUrl));
	}

	@Test
	void testLoadFileLocally_FileExists() throws IOException {
		Path path = Files.createTempFile("testFile", ".txt");
		byte[] content = {1, 2, 3};
		Files.write(path, content);
		byte[] result = fileService.loadFileLocally(path.toString());
		assertArrayEquals(content, result, "Loaded file content should match expected");
		Files.delete(path);
	}

	@Test
	void testLoadFileLocally_FileDoesNotExist() {
		byte[] result = fileService.loadFileLocally("nonexistent.txt");
		assertArrayEquals(new byte[]{}, result, "Should return empty byte array for nonexistent file");
	}

	@Test
	void testUnzipFileInFolder_Success() throws IOException {
		ZipFile zipFileMock = mock(ZipFile.class);
		ZipFileFactory zipFileFactoryMock = mock(ZipFileFactory.class);
		when(zipFileFactoryMock.createZipFile(anyString())).thenReturn(zipFileMock);
		FileServiceImpl fileService = new FileServiceImpl(zipFileFactoryMock, restTemplateBuilder);
		byte[] zipContent = {};
		Path tempPath = Files.createTempDirectory("testUnzip");
		doNothing().when(zipFileMock).extractAll(anyString());
		fileService.unzipFileInFolder(zipContent);
		verify(zipFileMock).extractAll(anyString());
		Files.delete(tempPath);
	}

	@Test
	void testSaveFileInFolder_Success() throws IOException {
		Path path = Files.createTempFile("testSave", ".txt");
		byte[] content = {1, 2, 3};
		fileService.saveFileInFolder(content, path);
		assertArrayEquals(Files.readAllBytes(path), content, "Saved file content should match expected");
		Files.delete(path);
	}

	@Test
	void testSaveFileInFolder_Failure() throws IOException {
		Path invalidPath = Paths.get("/invalid/testSave.txt");
		byte[] content = {1, 2, 3};
		try (MockedStatic<Files> mockedFiles = mockStatic(Files.class)) {
			mockedFiles.when(() -> Files.write(invalidPath, content)).thenThrow(new IOException("Cannot write to file"));
			assertThrows(SaveFileException.class, () -> fileService.saveFileInFolder(content, invalidPath));
			mockedFiles.verify(() -> Files.write(invalidPath, content), times(1));
		}
	}

	@Test
	void testCleanUpFile_Success() throws IOException {
		Path path = Files.createTempFile("testCleanUp", ".txt");
		Files.deleteIfExists(path);
		fileService.cleanUpFile(path);
		assertFalse(Files.exists(path), "File should be deleted");
	}

	@Test
	void testCleanUpFile_Failure() throws IOException {
		Path invalidPath = Paths.get("nonexistent-path");
		try (MockedStatic<Files> mockedFiles = mockStatic(Files.class)) {
			mockedFiles.when(() -> Files.deleteIfExists(invalidPath)).thenThrow(new IOException("File not found"));
			assertThrows(DeleteFileException.class, () -> fileService.cleanUpFile(invalidPath));
			mockedFiles.verify(() -> Files.deleteIfExists(invalidPath), times(1));
		}
	}

	@Test
	void testDeleteDirectory_Success() throws IOException {
		Path dir = Files.createTempDirectory("testDir");
		fileService.deleteDirectory(dir);
		assertFalse(Files.exists(dir), "Directory should be deleted");
	}

	@Test
	void testUnzipFileInFolder_Failure() throws ZipException {
		byte[] zipContent = {};
		ZipFile zipFileMock = mock(ZipFile.class);
		ZipFileFactory zipFileFactoryMock = mock(ZipFileFactory.class);
		when(zipFileFactoryMock.createZipFile(anyString())).thenReturn(zipFileMock);
		doThrow(new ZipException("Zip extraction error")).when(zipFileMock).extractAll(anyString());
		FileServiceImpl fileService = new FileServiceImpl(zipFileFactoryMock, restTemplateBuilder);
		assertThrows(ExtractZipFileException.class, () -> fileService.unzipFileInFolder(zipContent));
	}

	@Test
	void testLoadFileLocally_IOException() {
		String localFilePath = "invalid/path/to/file.txt";
		Path path = Paths.get(localFilePath);
		try (MockedStatic<Files> mockedFiles = mockStatic(Files.class)) {
			mockedFiles.when(() -> Files.notExists(path)).thenReturn(false);
			mockedFiles.when(() -> Files.readAllBytes(path)).thenThrow(new IOException("Simulated IOException"));
			FileServiceImpl fileService = new FileServiceImpl(null, null);
			byte[] result = fileService.loadFileLocally(localFilePath);
			assertArrayEquals(new byte[]{}, result, "Should return an empty byte array on IOException");
			mockedFiles.verify(() -> Files.readAllBytes(path), times(1));
		}
	}

	@Test
	void testDeleteDirectory_IOException() throws IOException {
		Path path = Path.of("invalid/path/to/directory");
		try (var mockedFileSystemUtils = mockStatic(FileSystemUtils.class)) {
			mockedFileSystemUtils.when(() -> FileSystemUtils.deleteRecursively(path))
					.thenThrow(new IOException("Simulated IOException"));
			FileServiceImpl fileService = new FileServiceImpl(null, null);
			assertThrows(DeleteFolderException.class, () -> fileService.deleteDirectory(path));
			mockedFileSystemUtils.verify(() -> FileSystemUtils.deleteRecursively(path), times(1));
		}
	}


	@Test
	void testDownloadFileByUrl_ResponseBodyNotNull() {
		String fileUrl = "http://example.com/file.zip";
		byte[] fileContent = {1, 2, 3};
		RestTemplate restTemplateMock = mock(RestTemplate.class);

		when(restTemplateBuilder.setConnectTimeout(any())).thenReturn(restTemplateBuilder);
		when(restTemplateBuilder.setReadTimeout(any())).thenReturn(restTemplateBuilder);
		when(restTemplateBuilder.build()).thenReturn(restTemplateMock);
		when(restTemplateMock.exchange(eq(fileUrl), eq(HttpMethod.GET), any(HttpEntity.class), eq(byte[].class)))
				.thenReturn(ResponseEntity.ok(fileContent));

		byte[] result = fileService.downloadFileByUrl(fileUrl);

		assertArrayEquals(fileContent, result, "Should return the response body when it is not null");
	}

	@Test
	void testDownloadFileByUrl_ResponseBodyNull() {
		String fileUrl = "http://example.com/file.zip";
		RestTemplate restTemplateMock = mock(RestTemplate.class);

		when(restTemplateBuilder.setConnectTimeout(any())).thenReturn(restTemplateBuilder);
		when(restTemplateBuilder.setReadTimeout(any())).thenReturn(restTemplateBuilder);
		when(restTemplateBuilder.build()).thenReturn(restTemplateMock);
		when(restTemplateMock.exchange(eq(fileUrl), eq(HttpMethod.GET), any(HttpEntity.class), eq(byte[].class)))
				.thenReturn(ResponseEntity.ok(null));

		byte[] result = fileService.downloadFileByUrl(fileUrl);

		assertArrayEquals(new byte[]{}, result, "Should return an empty byte array when response body is null");
	}

}
