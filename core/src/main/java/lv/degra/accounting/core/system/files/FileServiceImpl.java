package lv.degra.accounting.core.system.files;

import static lv.degra.accounting.core.system.utils.DateUtil.getFormattedDate;
import static org.apache.commons.lang3.RandomStringUtils.randomAlphanumeric;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.Date;

import org.apache.commons.lang3.ArrayUtils;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.FileSystemUtils;
import org.springframework.web.client.RestTemplate;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import lv.degra.accounting.core.system.files.exception.*;

import net.lingala.zip4j.exception.ZipException;

@Service
@Slf4j
@RequiredArgsConstructor
public class FileServiceImpl implements FileService {

	private static final String ZIP_EXTENSION = ".zip";
	private static final String TEMP_DIRECTORY_PREFIX = "extracted_zip";

	private final ZipFileFactory zipFileFactory;
	private final RestTemplate restTemplate;

	@Override
	public byte[] downloadFileByUrl(String fileUrl) {
		try {
			HttpHeaders headers = new HttpHeaders();
			headers.setAccept(Collections.singletonList(MediaType.APPLICATION_OCTET_STREAM));

			HttpEntity<String> entity = new HttpEntity<>(headers);
			ResponseEntity<byte[]> response = restTemplate.exchange(fileUrl, HttpMethod.GET, entity, byte[].class);

			return response.getBody() != null ? response.getBody() : ArrayUtils.EMPTY_BYTE_ARRAY;
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
			return ArrayUtils.EMPTY_BYTE_ARRAY;
		}

		try {
			log.info("Loading file locally: {}", localFilePath);
			return Files.readAllBytes(path);
		} catch (IOException e) {
			log.error("Error reading file locally: {}", localFilePath, e);
			return ArrayUtils.EMPTY_BYTE_ARRAY;
		}
	}

	@Override
	public String unzipFileInFolder(byte[] content) {
		Path zipPath = createTempZipFile(content);
		Path targetDir = getTempDirectoryPath();

		try {
			Files.createDirectories(targetDir);
			zipFileFactory.createZipFile(zipPath.toString()).extractAll(targetDir.toString());
			return zipPath.getParent().toString();
		} catch (ZipException e) {
			log.error("Error extracting ZIP file: {}", zipPath, e);
			throw new ExtractZipFileException("Failed to extract ZIP file: " + e.getMessage(), e);
		} catch (IOException e) {
			log.error("Error creating directory for ZIP extraction: {}", getTempDirectoryPath(), e);
			throw new ExtractZipFileException("Failed to create directory for ZIP extraction: " + e.getMessage(), e);
		} finally {
			try {
				cleanUpFile(zipPath);
			} catch (DeleteFileException e) {
				log.warn("Failed to clean up temporary ZIP file: {}", zipPath, e);
			}
		}
	}

	@Override
	public void saveFileInFolder(byte[] content, Path filePath) {
		try {
			if (filePath.getParent() != null) {
				Files.createDirectories(filePath.getParent());
			}
			Files.write(filePath, content);
		} catch (IOException e) {
			log.error("Failed to save file: {}", filePath, e);
			throw new SaveFileException("Error saving file to path: " + filePath, e);
		}
	}

	@Override
	public void cleanUpFile(Path path) {
		if (path == null) {
			log.warn("Attempted to delete a null path");
			return;
		}

		try {
			Files.deleteIfExists(path);
		} catch (IOException e) {
			log.error("Failed to delete file: {}", path, e);
			throw new DeleteFileException("Error deleting file: " + path, e);
		}
	}

	@Override
	public void deleteDirectory(Path path) {
		if (path == null) {
			log.warn("Attempted to delete a null directory path");
			return;
		}

		try {
			if (!Files.exists(path) || !Files.isDirectory(path)) {
				log.warn("Directory does not exist or is not a directory: {}", path);
			}

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
		try {
			Path tempDir = getTempDirectoryPath();
			Files.createDirectories(tempDir);

			String zipFileName = randomAlphanumeric(8) + ZIP_EXTENSION;
			Path zipPath = tempDir.resolve(zipFileName);

			saveFileInFolder(content, zipPath);
			return zipPath;
		} catch (IOException e) {
			log.error("Failed to create temporary directory for ZIP file", e);
			throw new SaveFileException("Error creating temporary directory for ZIP file", e);
		}
	}
}
