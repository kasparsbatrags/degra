package lv.degra.accounting.core.user.exception;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertNull;

import org.junit.jupiter.api.Test;

class UserValidationExceptionTest {

	@Test
	void testConstructorWithMessage() {
		// Arrange
		String expectedMessage = "Validation failed";

		// Act
		UserValidationException exception = new UserValidationException(expectedMessage);

		// Assert
		assertEquals(expectedMessage, exception.getMessage(), "Exception message should match the provided message");
	}

	@Test
	void testConstructorWithNullMessage() {
		// Act
		UserValidationException exception = new UserValidationException(null);

		// Assert
		assertNull(exception.getMessage(), "Message should be null when not provided");
	}

	@Test
	void testInheritance() {
		// Act
		UserValidationException exception = new UserValidationException("Test message");

		// Assert
		assertInstanceOf(RuntimeException.class, exception, "UserValidationException should extend RuntimeException");
	}
}
