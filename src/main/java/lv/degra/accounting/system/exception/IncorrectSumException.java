package lv.degra.accounting.system.exception;

public class IncorrectSumException extends NumberFormatException  {
    public IncorrectSumException(String message) {
            super(message);
        }
}
