package lv.degra.accounting.core.system.files.exception;

public class DeleteFileException extends RuntimeException {
	public DeleteFileException(String message, Throwable cause) {
		super(message,cause);
	}
}
