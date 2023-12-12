package lv.degra.accounting.system.exception;

public class CannotPerformException extends UnsupportedOperationException  {
    public CannotPerformException(String message) {
            super(message);
        }
}
