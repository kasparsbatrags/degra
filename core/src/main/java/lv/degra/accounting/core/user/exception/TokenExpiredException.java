package lv.degra.accounting.core.user.exception;

public class TokenExpiredException extends RuntimeException {
    private final String errorCode;

    public TokenExpiredException(String message) {
        super(message);
        this.errorCode = "TOKEN_EXPIRED";
    }

    public TokenExpiredException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
