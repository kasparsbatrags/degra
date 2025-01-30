package lv.degra.accounting.core.user.exception;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import org.junit.jupiter.api.Test;

class KeycloakIntegrationExceptionTest {

	@Test
	void testConstructorAndGetMessage() {
		// Arrange
		String expectedMessage = "Integration failed";
		String expectedErrorCode = "ERROR_123";

		// Act
		KeycloakIntegrationException exception = new KeycloakIntegrationException(expectedMessage, expectedErrorCode);

		// Assert
		assertEquals(expectedMessage, exception.getMessage(), "Exception message should match the provided message");
	}

	@Test
	void testGetErrorCode() {
		// Arrange
		String expectedErrorCode = "ERROR_123";

		// Act
		KeycloakIntegrationException exception = new KeycloakIntegrationException("Integration failed", expectedErrorCode);

		// Assert
		assertEquals(expectedErrorCode, exception.getErrorCode(), "Error code should match the provided value");
	}

	@Test
	void testNullErrorCode() {
		// Arrange
		String expectedMessage = "Integration failed";

		// Act
		KeycloakIntegrationException exception = new KeycloakIntegrationException(expectedMessage, null);

		// Assert
		assertNull(exception.getErrorCode(), "Error code should be null when not provided");
		assertEquals(expectedMessage, exception.getMessage(), "Exception message should still be accessible");
	}

	@Test
	void testNullMessage() {
		// Arrange
		String expectedErrorCode = "ERROR_123";

		// Act
		KeycloakIntegrationException exception = new KeycloakIntegrationException(null, expectedErrorCode);

		// Assert
		assertNull(exception.getMessage(), "Message should be null when not provided");
		assertEquals(expectedErrorCode, exception.getErrorCode(), "Error code should still be accessible");
	}
}
