package lv.degra.accounting.core.user.exception;

public class UserUniqueException extends RuntimeException {
	public UserUniqueException(String message) {
		super(message);
	}
}