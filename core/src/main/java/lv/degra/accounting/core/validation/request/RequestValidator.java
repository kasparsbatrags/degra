package lv.degra.accounting.core.validation.request;


import lv.degra.accounting.core.exception.InvalidRequestException;

public class RequestValidator {

	private RequestValidator() {
	}

	public static void validatePageRequest(int page, int size) {
		if (page < 0) {
			throw new InvalidRequestException("Page number cannot be negative");
		}
		if (size <= 0 || size > 100) {
			throw new InvalidRequestException("Page size must be between 1 and 100");
		}
	}
}
