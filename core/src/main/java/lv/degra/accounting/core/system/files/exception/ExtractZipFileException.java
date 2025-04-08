package lv.degra.accounting.core.system.files.exception;

public class ExtractZipFileException extends RuntimeException {
	public ExtractZipFileException(String message) {
		super(message);
	}

	public ExtractZipFileException(String message, Throwable cause) {
		super(message, cause);
	}
}
