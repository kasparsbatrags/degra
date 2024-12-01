package lv.degra.accounting.core.system.files;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

import net.lingala.zip4j.ZipFile;

class ZipFileFactoryTest {

	private final ZipFileFactory zipFileFactory = new ZipFileFactory();

	@Test
	void testCreateZipFile_Success() {
		String zipFilePath = "valid-path-to-zip.zip";
		ZipFile zipFile = zipFileFactory.createZipFile(zipFilePath);

		assertNotNull(zipFile, "ZipFile should be created successfully");
		assertNotNull(zipFile.getFile(), "The file associated with ZipFile should not be null");
	}

	@Test
	void testCreateZipFile_InvalidPath() {
		String invalidZipFilePath = null;

		assertThrows(NullPointerException.class, () -> zipFileFactory.createZipFile(invalidZipFilePath),
				"Creating a ZipFile with a null path should throw NullPointerException");
	}

	@Test
	void testCreateZipFile_EmptyPath() {
		String emptyZipFilePath = "";

		ZipFile zipFile = zipFileFactory.createZipFile(emptyZipFilePath);

		assertNotNull(zipFile, "ZipFile should still be created for an empty path");
		assertNotNull(zipFile.getFile(), "The file associated with ZipFile should not be null");
	}
}
