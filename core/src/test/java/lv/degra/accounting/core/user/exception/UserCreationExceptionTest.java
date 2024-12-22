package lv.degra.accounting.core.user.exception;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertNull;

import org.junit.jupiter.api.Test;

class UserCreationExceptionTest {

	@Test
	void testConstructorWithMessage() {
		// Arrange
		String expectedMessage = "User creation failed";

		// Act
		UserCreationException exception = new UserCreationException(expectedMessage);

		// Assert
		assertEquals(expectedMessage, exception.getMessage(), "Exception message should match the provided message");
	}

	@Test
	void testConstructorWithNullMessage() {
		// Act
		UserCreationException exception = new UserCreationException(null);

		// Assert
		assertNull(exception.getMessage(), "Message should be null when not provided");
	}

	@Test
	void testInheritance() {
		// Act
		UserCreationException exception = new UserCreationException("Test message");

		// Assert
		assertInstanceOf(RuntimeException.class, exception, "UserCreationException should extend RuntimeException");
	}
}
