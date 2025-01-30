package lv.degra.accounting.core.system.files;

import org.springframework.stereotype.Component;

import net.lingala.zip4j.ZipFile;

@Component
public class ZipFileFactory {
	public ZipFile createZipFile(String zipFilePath) {
		return new ZipFile(zipFilePath);
	}
}
