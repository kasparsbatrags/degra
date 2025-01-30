package lv.degra.accounting.core.address.register.exception;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class DownloadAddressDataExceptionTest {

	@Test
	void testConstructorWithMessage() {
		String errorMessage = "Failed to download address data";
		DownloadAddressDataException exception = new DownloadAddressDataException(errorMessage);

		// Assert that the exception contains the correct message
		assertNotNull(exception, "Exception instance should not be null");
		assertEquals(errorMessage, exception.getMessage(), "Exception message should match the provided message");
	}

	@Test
	void testInheritance() {
		// Ensure the exception is a subclass of RuntimeException
		DownloadAddressDataException exception = new DownloadAddressDataException("Test message");
		assertInstanceOf(RuntimeException.class, exception, "DownloadAddressDataException should inherit from RuntimeException");
	}
}
