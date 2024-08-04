package lv.degra.accounting.desktop.system.exception;

public class DegraRuntimeException extends RuntimeException  {
	public DegraRuntimeException(String message) {
		super(message);
	}
	public DegraRuntimeException(String message, Throwable cause) {
		super(message, cause);
	}
}
