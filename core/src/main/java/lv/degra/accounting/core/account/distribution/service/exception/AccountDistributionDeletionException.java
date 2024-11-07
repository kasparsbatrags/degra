package lv.degra.accounting.core.account.distribution.service.exception;

public class AccountDistributionDeletionException extends RuntimeException {
	public AccountDistributionDeletionException(String message) {
		super(message);
	}

	public AccountDistributionDeletionException(String message, Throwable cause) {
		super(message, cause);
	}
}
