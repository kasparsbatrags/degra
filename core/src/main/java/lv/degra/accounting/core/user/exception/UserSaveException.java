package lv.degra.accounting.core.user.exception;

public class UserSaveException extends RuntimeException {
    private final String errorCode;

    public UserSaveException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
