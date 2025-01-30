package lv.degra.accounting.core.system.files.exception;

import net.lingala.zip4j.exception.ZipException;

public class ExtractZipFileException extends ZipException {
	public ExtractZipFileException(String message) {
		super(message);
	}
}
