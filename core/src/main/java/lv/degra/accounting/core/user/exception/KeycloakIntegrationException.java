package lv.degra.accounting.core.user.exception;

public class KeycloakIntegrationException extends RuntimeException {
	private final String errorCode;

	public KeycloakIntegrationException(String message, String errorCode) {
		super(message);
		this.errorCode = errorCode;
	}

	public String getErrorCode() {
		return errorCode;
	}
}
