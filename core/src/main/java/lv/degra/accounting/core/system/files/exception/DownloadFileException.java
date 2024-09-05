package lv.degra.accounting.core.system.files.exception;

public class DownloadFileException extends RuntimeException {
	public DownloadFileException(String message, Throwable cause) {
		super(message,cause);
	}
}
