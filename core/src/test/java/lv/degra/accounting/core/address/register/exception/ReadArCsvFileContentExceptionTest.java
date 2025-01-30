package lv.degra.accounting.core.address.register.exception;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class ReadArCsvFileContentExceptionTest {

	@Test
	void testConstructorWithMessage() {
		String errorMessage = "Failed to read CSV file content";
		ReadArCsvFileContentException exception = new ReadArCsvFileContentException(errorMessage);

		// Assert that the exception contains the correct message
		assertNotNull(exception, "Exception instance should not be null");
		assertEquals(errorMessage, exception.getMessage(), "Exception message should match the provided message");
	}

	@Test
	void testInheritance() {
		// Ensure the exception is a subclass of RuntimeException
		ReadArCsvFileContentException exception = new ReadArCsvFileContentException("Test message");
		assertInstanceOf(RuntimeException.class, exception, "ReadArCsvFileContentException should inherit from RuntimeException");
	}
}
