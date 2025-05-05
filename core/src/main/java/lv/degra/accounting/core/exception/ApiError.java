package lv.degra.accounting.core.exception;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class
ApiError {
	LocalDateTime timestamp;
	int status;
	String error;
	String message;
	String path;
	String errorCode;
	String traceId;
}
