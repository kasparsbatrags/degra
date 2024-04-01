package lv.degra.accounting.system.files.exception;

public class DeleteFileException extends RuntimeException {
	public DeleteFileException(String message, Throwable cause) {
		super(message,cause);
	}
}
