package lv.degra.accounting.system.exception;

import java.io.IOException;

public class DegraRuntimeException extends RuntimeException  {
	public DegraRuntimeException(String message) {
		super(message);
	}
	public DegraRuntimeException(String message, Throwable cause) {
		super(message, cause);
	}
}
