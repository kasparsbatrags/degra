package lv.degra.accounting.core.document.service.exception;

public class DocumentDeletionException extends RuntimeException {
	public DocumentDeletionException(String message) {
		super(message);
	}

	public DocumentDeletionException(String message, Throwable cause) {
		super(message, cause);
	}
}
