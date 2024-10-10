package lv.degra.accounting.core.document.bill.service.exception;

public class BillRowDeletionException extends RuntimeException {
	public BillRowDeletionException(String message) {
		super(message);
	}

	public BillRowDeletionException(String message, Throwable cause) {
		super(message, cause);
	}
}
