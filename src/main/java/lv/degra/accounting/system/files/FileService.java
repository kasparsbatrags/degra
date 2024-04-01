package lv.degra.accounting.system.files;

import java.nio.file.Path;

public interface FileService {

	byte[] downloadFileByUrl(String fileUrl, String orLocalOpenFilePath) ;

	byte[] loadFileLocally(String localFilePath);

	String unzipFileInFolder(byte[] csvFileBytes);

	Path getTempDirectoryPath();

	void saveFileInFolder(byte[] csvFileBytes, Path fileNamePath);

	void cleanUpFile(Path path);

	void deleteDirectory(Path path);
}
