package lv.degra.accounting.core.user.dto;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import java.util.Map;
import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

class UserRegistrationDtoTest {

	private Validator validator;

	@BeforeEach
	void setUp() {
		try (ValidatorFactory factory = Validation.buildDefaultValidatorFactory()) {
			validator = factory.getValidator();
		}
	}

	@Test
	void testValidUserRegistrationDto() {
		// Arrange
		CredentialDto credential = new CredentialDto();
		credential.setType("password");
		credential.setValue("12345");
		credential.setTemporary(false);

		UserRegistrationDto dto = new UserRegistrationDto();
		dto.setUsername("john.doe");
		dto.setEmail("john.doe@example.com");
		dto.setFirstName("John");
		dto.setLastName("Doe");
		dto.setAttributes(Map.of("key", "value"));
		dto.setEnabled(true);
		dto.setCredentials(List.of(credential));

		// Act
		Set<ConstraintViolation<UserRegistrationDto>> violations = validator.validate(dto);

		// Assert
		assertTrue(violations.isEmpty(), "Valid UserRegistrationDto should not have validation errors");
	}

	@Test
	void testInvalidUserRegistrationDto_MissingUsername() {
		// Arrange
		UserRegistrationDto dto = createInvalidDto();
		dto.setUsername("");

		// Act
		Set<ConstraintViolation<UserRegistrationDto>> violations = validator.validate(dto);

		// Assert
		assertViolationMessage(violations, "username", "Username is required");
	}

	@Test
	void testInvalidUserRegistrationDto_InvalidEmail() {
		// Arrange
		UserRegistrationDto dto = createInvalidDto();
		dto.setEmail("invalid-email");

		// Act
		Set<ConstraintViolation<UserRegistrationDto>> violations = validator.validate(dto);

		// Assert
		assertViolationMessage(violations, "email", "Invalid email format");
	}

	@Test
	void testInvalidUserRegistrationDto_MissingFirstName() {
		// Arrange
		UserRegistrationDto dto = createInvalidDto();
		dto.setFirstName("");

		// Act
		Set<ConstraintViolation<UserRegistrationDto>> violations = validator.validate(dto);

		// Assert
		assertViolationMessage(violations, "firstName", "First name is required");
	}

	@Test
	void testInvalidUserRegistrationDto_MissingLastName() {
		// Arrange
		UserRegistrationDto dto = createInvalidDto();
		dto.setLastName("");

		// Act
		Set<ConstraintViolation<UserRegistrationDto>> violations = validator.validate(dto);

		// Assert
		assertViolationMessage(violations, "lastName", "Last name is required");
	}

	@Test
	void testInvalidUserRegistrationDto_MissingEnabled() {
		// Arrange
		UserRegistrationDto dto = createInvalidDto();
		dto.setEnabled(null);

		// Act
		Set<ConstraintViolation<UserRegistrationDto>> violations = validator.validate(dto);

		// Assert
		assertViolationMessage(violations, "enabled", "Enabled status is required");
	}

	@Test
	void testInvalidUserRegistrationDto_MissingCredentials() {
		// Arrange
		UserRegistrationDto dto = createInvalidDto();
		dto.setCredentials(null);

		// Act
		Set<ConstraintViolation<UserRegistrationDto>> violations = validator.validate(dto);

		// Assert
		assertViolationMessage(violations, "credentials", "Credentials are required");
	}

	@Test
	void testGetterAndSetter() {
		// Arrange
		UserRegistrationDto dto = new UserRegistrationDto();

		CredentialDto credential = new CredentialDto();
		credential.setType("password");
		credential.setValue("12345");
		credential.setTemporary(false);

		// Act
		dto.setUsername("john.doe");
		dto.setEmail("john.doe@example.com");
		dto.setFirstName("John");
		dto.setLastName("Doe");
		dto.setAttributes(Map.of("key", "value"));
		dto.setEnabled(true);
		dto.setCredentials(List.of(credential));

		// Assert
		assertEquals("john.doe", dto.getUsername(), "Getter for 'username' should return correct value");
		assertEquals("john.doe@example.com", dto.getEmail(), "Getter for 'email' should return correct value");
		assertEquals("John", dto.getFirstName(), "Getter for 'firstName' should return correct value");
		assertEquals("Doe", dto.getLastName(), "Getter for 'lastName' should return correct value");
		assertEquals(Map.of("key", "value"), dto.getAttributes(), "Getter for 'attributes' should return correct value");
		assertTrue(dto.getEnabled(), "Getter for 'enabled' should return correct value");
		assertEquals(List.of(credential), dto.getCredentials(), "Getter for 'credentials' should return correct value");
	}

	// Helper methods
	private UserRegistrationDto createInvalidDto() {
		UserRegistrationDto dto = new UserRegistrationDto();
		dto.setEmail("john.doe@example.com");
		dto.setFirstName("John");
		dto.setLastName("Doe");
		dto.setAttributes(Map.of("key", "value"));
		dto.setEnabled(true);
		dto.setCredentials(List.of(new CredentialDto()));
		return dto;
	}

	private void assertViolationMessage(Set<ConstraintViolation<UserRegistrationDto>> violations, String field, String expectedMessage) {
		assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals(field) && v.getMessage().equals(expectedMessage)),
				"Expected validation error for field '" + field + "' with message '" + expectedMessage + "'");
	}
}
