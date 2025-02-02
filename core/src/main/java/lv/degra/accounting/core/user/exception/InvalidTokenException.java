package lv.degra.accounting.core.user.exception;

public class InvalidTokenException extends RuntimeException {
    private final String errorCode;

    public InvalidTokenException(String message) {
        super(message);
        this.errorCode = "INVALID_TOKEN";
    }

    public InvalidTokenException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
