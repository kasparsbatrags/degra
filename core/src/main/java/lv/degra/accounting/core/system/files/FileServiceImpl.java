package lv.degra.accounting.core.system.files;

import static lv.degra.accounting.core.system.utils.DateUtil.getFormattedDate;

import java.io.File;
import java.io.IOException;
import java.nio.file.FileSystems;
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
import lv.degra.accounting.core.system.exception.ExtractZipFileException;
import lv.degra.accounting.core.system.files.exception.DeleteFileException;
import lv.degra.accounting.core.system.files.exception.DeleteFolderException;
import lv.degra.accounting.core.system.files.exception.DownloadFileException;
import lv.degra.accounting.core.system.files.exception.SaveFileException;
import net.lingala.zip4j.ZipFile;
import net.lingala.zip4j.exception.ZipException;


@Service
@Slf4j
public class FileServiceImpl implements FileService {

    public static final String ZIP_EXTRACT_TEMP_DIRECTORY_PREFIX = "extracted_zip";
    private final RestTemplateBuilder restTemplate;
    @Value("${application.file-download-connect-timeout-sec:300}")
    private int fileDownloadConnectTimeoutSec;

    @Value("${application.file-download-read-timeout-sec:300}")
    private int fileDownloadReadTimeoutSec;

    public FileServiceImpl(RestTemplateBuilder restTemplate) {
        this.restTemplate = restTemplate;
    }

    public byte[] downloadFileByUrl(String fileUrl) {

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setAccept(Collections.singletonList(MediaType.APPLICATION_OCTET_STREAM));
            HttpEntity<String> entity = new HttpEntity<>(headers);
            restTemplate.setConnectTimeout(Duration.ofSeconds(fileDownloadConnectTimeoutSec));
            restTemplate.setReadTimeout(Duration.ofSeconds(fileDownloadReadTimeoutSec));
            ResponseEntity<byte[]> response = restTemplate.build().exchange(fileUrl, HttpMethod.GET, entity, byte[].class);
            return response.getBody() != null ? response.getBody() : new byte[]{};
        } catch (Exception e) {
            log.error("File download exception:", e);
            throw new DownloadFileException(e.getMessage(),e.getCause());
        }
    }

    public byte[] loadFileLocally(String localFilePath) {
        try {
            Path path = Paths.get(localFilePath);
            if (Files.exists(path)) {
                log.info("File load locally: {}", localFilePath);
                return Files.readAllBytes(path);
            } else {
                log.error("Unable to find file locally at:{}", path);
                return new byte[]{};
            }
        } catch (Exception e) {
            log.error("File unable to locally load. Exception:", e);
        }
        return new byte[]{};
    }

    public String unzipFileInFolder(byte[] content) {

        Path fileNameFullPath = Paths.get(getTempDirectoryPath() + File.separator + String.format("%s.%s", RandomStringUtils.randomAlphanumeric(8), "zip"));
        saveFileInFolder(content, fileNameFullPath);

        try {
            new ZipFile(fileNameFullPath.toString()).extractAll(getTempDirectoryPath().toString());
        } catch (ZipException e) {
            throw new ExtractZipFileException(e.getMessage());
        } finally {
			cleanUpFile(fileNameFullPath);
		}
        return fileNameFullPath.getParent().toString();
    }

    public void saveFileInFolder(byte[] content, Path fileNamePath) {
        try {
            Files.createDirectories(fileNamePath.getParent());
       Files.write(fileNamePath, content);
        } catch (IOException e) {
            throw new SaveFileException(e.getMessage(), e);
        }
    }

    public Path getTempDirectoryPath() {
        return Paths.get(System.getProperty("java.io.tmpdir") + FileSystems.getDefault().getSeparator() + ZIP_EXTRACT_TEMP_DIRECTORY_PREFIX + getFormattedDate(new Date()));
    }

    public void cleanUpFile(Path path) {
        try {
            Files.delete(path);
        } catch (Exception e) {
            throw new DeleteFileException(e.getMessage(), e.getCause());
        }
    }

    public void deleteDirectory(Path path) {
        try {
            FileSystemUtils.deleteRecursively(path);
        } catch (IOException e) {
            throw new DeleteFolderException(e.getMessage(), e.getCause());
        }
    }


}
