package lv.degra.accounting.core.exception;

import java.nio.file.AccessDeniedException;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.stream.Collectors;

import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

	@ExceptionHandler(ResourceNotFoundException.class)
	public ResponseEntity<ApiError> handleResourceNotFoundException(
			ResourceNotFoundException ex, WebRequest request) {
		String traceId = UUID.randomUUID().toString();
		MDC.put("traceId", traceId);

		log.warn("Resource not found: {}. Trace ID: {}", ex.getMessage(), traceId);

		ApiError apiError = ApiError.builder()
				.timestamp(LocalDateTime.now())
				.status(HttpStatus.NOT_FOUND.value())
				.error("Resource Not Found")
				.message(ex.getMessage())
				.path(request.getDescription(false).substring(4))
				.errorCode("RESOURCE_NOT_FOUND")
				.traceId(traceId)
				.build();

		MDC.clear();
		return new ResponseEntity<>(apiError, HttpStatus.NOT_FOUND);
	}


	@ExceptionHandler(NoHandlerFoundException.class)
	public ResponseEntity<ApiError> handleNoHandlerFoundException(
			NoHandlerFoundException ex, WebRequest request) {
		String traceId = UUID.randomUUID().toString();
		MDC.put("traceId", traceId);

		log.warn("Endpoint not found: {}. Trace ID: {}", request.getDescription(false), traceId);

		ApiError apiError = ApiError.builder()
				.timestamp(LocalDateTime.now())
				.status(HttpStatus.NOT_FOUND.value())
				.error("Not Found")
				.message("The requested endpoint does not exist.")
				.path(request.getDescription(false).substring(4))
				.errorCode("ENDPOINT_NOT_FOUND")
				.traceId(traceId)
				.build();

		MDC.clear();
		return new ResponseEntity<>(apiError, HttpStatus.NOT_FOUND);
	}

	@ExceptionHandler(NoResourceFoundException.class)
	public ResponseEntity<ApiError> handleNoHandlerFoundException(
			NoResourceFoundException ex, WebRequest request) {
		String traceId = UUID.randomUUID().toString();
		MDC.put("traceId", traceId);

		log.warn("Endpoint not found: {}. Trace ID: {}", request.getDescription(false), traceId);

		ApiError apiError = ApiError.builder()
				.timestamp(LocalDateTime.now())
				.status(HttpStatus.NOT_FOUND.value())
				.error("Not Found")
				.message("The requested endpoint does not exist.")
				.path(request.getDescription(false).substring(4))
				.errorCode("ENDPOINT_NOT_FOUND")
				.traceId(traceId)
				.build();

		MDC.clear();
		return new ResponseEntity<>(apiError, HttpStatus.NOT_FOUND);
	}

	@ExceptionHandler(AccessDeniedException.class)
	public ResponseEntity<ApiError> handleAccessDeniedException(
			AccessDeniedException ex, WebRequest request) {
		String traceId = UUID.randomUUID().toString();
		MDC.put("traceId", traceId);

		log.warn("Access denied. Trace ID: {}", traceId);

		ApiError apiError = ApiError.builder()
				.timestamp(LocalDateTime.now())
				.status(HttpStatus.FORBIDDEN.value())
				.error("Access Denied")
				.message("You do not have permission to access this resource")
				.path(request.getDescription(false).substring(4))
				.errorCode("ACCESS_DENIED")
				.traceId(traceId)
				.build();

		MDC.clear();
		return new ResponseEntity<>(apiError, HttpStatus.FORBIDDEN);
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ApiError> handleValidationException(
			MethodArgumentNotValidException ex, WebRequest request) {
		String traceId = UUID.randomUUID().toString();
		MDC.put("traceId", traceId);

		String message = ex.getBindingResult().getFieldErrors().stream()
				.map(error -> error.getField() + ": " + error.getDefaultMessage())
				.collect(Collectors.joining(", "));

		log.warn("Validation error: {}. Trace ID: {}", message, traceId);

		ApiError apiError = ApiError.builder()
				.timestamp(LocalDateTime.now())
				.status(HttpStatus.BAD_REQUEST.value())
				.error("Validation Error")
				.message(message)
				.path(request.getDescription(false).substring(4))
				.errorCode("VALIDATION_ERROR")
				.traceId(traceId)
				.build();

		MDC.clear();
		return new ResponseEntity<>(apiError, HttpStatus.BAD_REQUEST);
	}

	@ExceptionHandler({
			ConstraintViolationException.class,
			InvalidRequestException.class,
			IllegalArgumentException.class,
			MissingServletRequestParameterException.class})
	public ResponseEntity<ApiError> handleValidationExceptions(
			Exception ex, WebRequest request) {
		String traceId = UUID.randomUUID().toString();
		MDC.put("traceId", traceId);

		log.warn("Bad request: {}. Trace ID: {}", ex.getMessage(), traceId);

		ApiError apiError = ApiError.builder()
				.timestamp(LocalDateTime.now())
				.status(HttpStatus.BAD_REQUEST.value())
				.error("Bad Request")
				.message(ex.getMessage())
				.path(request.getDescription(false).substring(4))
				.errorCode("BAD_REQUEST")
				.traceId(traceId)
				.build();

		MDC.clear();
		return new ResponseEntity<>(apiError, HttpStatus.BAD_REQUEST);
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ApiError> handleGlobalException(
			Exception ex, WebRequest request) {
		String traceId = UUID.randomUUID().toString();
		MDC.put("traceId", traceId);

		log.error("Unexpected error occurred. Trace ID: {}, Error: {}", traceId, ex.getMessage(), ex);

		ApiError apiError = ApiError.builder()
				.timestamp(LocalDateTime.now())
				.status(HttpStatus.INTERNAL_SERVER_ERROR.value())
				.error("Internal Server Error")
				.message("An unexpected error occurred. Please contact support if the issue persists.")
				.path(request.getDescription(false).substring(4))
				.errorCode("INTERNAL_ERROR")
				.traceId(traceId)
				.build();

		MDC.clear();
		return new ResponseEntity<>(apiError, HttpStatus.INTERNAL_SERVER_ERROR);
	}
}
