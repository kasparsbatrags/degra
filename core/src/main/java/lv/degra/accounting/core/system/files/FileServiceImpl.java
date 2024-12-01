package lv.degra.accounting.core.system.files;

import static lv.degra.accounting.core.system.utils.DateUtil.getFormattedDate;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;
import java.util.Collections;
import java.util.Date;

import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.FileSystemUtils;

import lombok.extern.slf4j.Slf4j;
import lv.degra.accounting.core.system.files.exception.DeleteFileException;
import lv.degra.accounting.core.system.files.exception.DeleteFolderException;
import lv.degra.accounting.core.system.files.exception.DownloadFileException;
import lv.degra.accounting.core.system.files.exception.ExtractZipFileException;
import lv.degra.accounting.core.system.files.exception.SaveFileException;
import net.lingala.zip4j.exception.ZipException;

@Service
@Slf4j
public class FileServiceImpl implements FileService {

	private static final String ZIP_EXTENSION = ".zip";
	private static final String TEMP_DIRECTORY_PREFIX = "extracted_zip";
	private final ZipFileFactory zipFileFactory;
	private final RestTemplateBuilder restTemplateBuilder;

	@Value("${application.file-download-connect-timeout-sec:300}")
	private int fileDownloadConnectTimeoutSec;

	@Value("${application.file-download-read-timeout-sec:300}")
	private int fileDownloadReadTimeoutSec;

	public FileServiceImpl(ZipFileFactory zipFileFactory, RestTemplateBuilder restTemplateBuilder) {
		this.zipFileFactory = zipFileFactory;
		this.restTemplateBuilder = restTemplateBuilder;
	}

	@Override
	public byte[] downloadFileByUrl(String fileUrl) {
		try {
			HttpHeaders headers = createHttpHeaders();
			HttpEntity<String> entity = new HttpEntity<>(headers);

			ResponseEntity<byte[]> response = restTemplateBuilder.setConnectTimeout(Duration.ofSeconds(fileDownloadConnectTimeoutSec))
					.setReadTimeout(Duration.ofSeconds(fileDownloadReadTimeoutSec)).build()
					.exchange(fileUrl, HttpMethod.GET, entity, byte[].class);

			return response.getBody() != null ? response.getBody() : new byte[] {};
		} catch (Exception e) {
			log.error("Failed to download file from URL: {}", fileUrl, e);
			throw new DownloadFileException("Error downloading file from URL: " + fileUrl, e);
		}
	}

	@Override
	public byte[] loadFileLocally(String localFilePath) {
		Path path = Paths.get(localFilePath);
		if (Files.notExists(path)) {
			log.warn("File does not exist: {}", localFilePath);
			return new byte[] {};
		}

		try {
			log.info("Loading file locally: {}", localFilePath);
			return Files.readAllBytes(path);
		} catch (IOException e) {
			log.error("Error reading file locally: {}", localFilePath, e);
			return new byte[] {};
		}
	}

	@Override
	public String unzipFileInFolder(byte[] content) throws ExtractZipFileException {
		Path zipPath = createTempZipFile(content);
		try {
			zipFileFactory.createZipFile(zipPath.toString()).extractAll(getTempDirectoryPath().toString());
			return zipPath.getParent().toString();
		} catch (ZipException e) {
			log.error("Error extracting ZIP file: {}", zipPath, e);
			throw new ExtractZipFileException("Failed to extract ZIP file: " + e.getMessage());
		} finally {
			cleanUpFile(zipPath);
		}
	}

	@Override
	public void saveFileInFolder(byte[] content, Path filePath) {
		try {
			Files.createDirectories(filePath.getParent());
			Files.write(filePath, content);
		} catch (IOException e) {
			log.error("Failed to save file: {}", filePath, e);
			throw new SaveFileException("Error saving file to path: " + filePath, e);
		}
	}

	@Override
	public void cleanUpFile(Path path) {
		try {
			Files.deleteIfExists(path);
		} catch (IOException e) {
			log.error("Failed to delete file: {}", path, e);
			throw new DeleteFileException("Error deleting file: " + path, e);
		}
	}

	@Override
	public void deleteDirectory(Path path) {
		try {
			FileSystemUtils.deleteRecursively(path);
		} catch (IOException e) {
			log.error("Failed to delete directory: {}", path, e);
			throw new DeleteFolderException("Error deleting directory: " + path, e);
		}
	}

	@Override
	public Path getTempDirectoryPath() {
		String tempDir = System.getProperty("java.io.tmpdir");
		String formattedDate = getFormattedDate(new Date());
		return Paths.get(tempDir, TEMP_DIRECTORY_PREFIX + formattedDate);
	}

	private Path createTempZipFile(byte[] content) {
		String zipFileName = RandomStringUtils.randomAlphanumeric(8) + ZIP_EXTENSION;
		Path zipPath = Paths.get(getTempDirectoryPath().toString(), zipFileName);
		saveFileInFolder(content, zipPath);
		return zipPath;
	}

	private HttpHeaders createHttpHeaders() {
		HttpHeaders headers = new HttpHeaders();
		headers.setAccept(Collections.singletonList(MediaType.APPLICATION_OCTET_STREAM));
		return headers;
	}
}
