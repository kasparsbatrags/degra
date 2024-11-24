package lv.degra.accounting.core.account.posted.service.exception;

public class AccountPostedDeletionException extends RuntimeException {
	public AccountPostedDeletionException(String message) {
		super(message);
	}

	public AccountPostedDeletionException(String message, Throwable cause) {
		super(message, cause);
	}
}
