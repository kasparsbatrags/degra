package lv.degra.accounting.core.user.exception;

public class UserValidationException extends RuntimeException {
	public UserValidationException(String message) {
		super(message);
	}
}