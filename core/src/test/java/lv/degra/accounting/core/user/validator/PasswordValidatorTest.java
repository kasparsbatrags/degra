package lv.degra.accounting.core.user.validator;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

import lv.degra.accounting.core.user.exception.UserValidationException;

class PasswordValidatorTest {

	private final PasswordValidator passwordValidator = new PasswordValidator();

	@Test
	void validate_ShouldPass_WhenPasswordIsValid() {
		String validPassword = "Valid1@Password";
		assertDoesNotThrow(() -> passwordValidator.validate(validPassword));
	}

	@Test
	void validate_ShouldThrow_WhenPasswordIsNull() {
		String nullPassword = null;
		UserValidationException exception = assertThrows(UserValidationException.class, () -> passwordValidator.validate(nullPassword));
		assertTrue(exception.getMessage().contains("Password must be at least 8 characters long"));
	}

	@Test
	void validate_ShouldThrow_WhenPasswordTooShort() {
		String shortPassword = "Ab1@";
		UserValidationException exception = assertThrows(UserValidationException.class, () -> passwordValidator.validate(shortPassword));
		assertTrue(exception.getMessage().contains("Password must be at least 8 characters long"));
	}

	@Test
	void validate_ShouldThrow_WhenPasswordMissingUppercase() {
		String missingUppercase = "valid1@password";
		UserValidationException exception = assertThrows(UserValidationException.class, () -> passwordValidator.validate(missingUppercase));
		assertTrue(exception.getMessage().contains("Password must contain at least one uppercase letter"));
	}

	@Test
	void validate_ShouldThrow_WhenPasswordMissingLowercase() {
		String missingLowercase = "VALID1@PASSWORD";
		UserValidationException exception = assertThrows(UserValidationException.class, () -> passwordValidator.validate(missingLowercase));
		assertTrue(exception.getMessage().contains("Password must contain at least one lowercase letter"));
	}

	@Test
	void validate_ShouldThrow_WhenPasswordMissingNumber() {
		String missingNumber = "Valid@Password";
		UserValidationException exception = assertThrows(UserValidationException.class, () -> passwordValidator.validate(missingNumber));
		assertTrue(exception.getMessage().contains("Password must contain at least one number"));
	}

	@Test
	void validate_ShouldThrow_WhenPasswordMissingSpecialCharacter() {
		String missingSpecialCharacter = "Valid1Password";
		UserValidationException exception = assertThrows(UserValidationException.class, () -> passwordValidator.validate(missingSpecialCharacter));
		assertTrue(exception.getMessage().contains("Password must contain at least one special character"));
	}

	@Test
	void validate_ShouldThrow_WhenMultipleViolationsPresent() {
		String invalidPassword = "short";
		UserValidationException exception = assertThrows(UserValidationException.class, () -> passwordValidator.validate(invalidPassword));
		assertTrue(exception.getMessage().contains("Password must be at least 8 characters long"));
		assertTrue(exception.getMessage().contains("Password must contain at least one uppercase letter"));
		assertTrue(exception.getMessage().contains("Password must contain at least one number"));
		assertTrue(exception.getMessage().contains("Password must contain at least one special character"));
	}
}
