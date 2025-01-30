package lv.degra.accounting.core.user.dto;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

class CredentialDtoTest {

	private Validator validator;

	@BeforeEach
	void setUp() {
		try (ValidatorFactory factory = Validation.buildDefaultValidatorFactory()) {
			validator = factory.getValidator();
		}
	}

	@Test
	void testValidCredentialDto() {
		// Arrange
		CredentialDto dto = new CredentialDto();
		dto.setType("password");
		dto.setValue("12345");
		dto.setTemporary(true);

		// Act
		Set<ConstraintViolation<CredentialDto>> violations = validator.validate(dto);

		// Assert
		assertTrue(violations.isEmpty(), "Valid CredentialDto should not have validation errors");
	}

	@Test
	void testInvalidCredentialDto_MissingType() {
		// Arrange
		CredentialDto dto = new CredentialDto();
		dto.setValue("12345");
		dto.setTemporary(true);

		// Act
		Set<ConstraintViolation<CredentialDto>> violations = validator.validate(dto);

		// Assert
		assertFalse(violations.isEmpty(), "Missing 'type' should trigger validation error");
		ConstraintViolation<CredentialDto> violation = violations.iterator().next();
		assertEquals("Credential type is required", violation.getMessage(), "Validation message for 'type'");
	}

	@Test
	void testInvalidCredentialDto_MissingValue() {
		// Arrange
		CredentialDto dto = new CredentialDto();
		dto.setType("password");
		dto.setTemporary(false);

		// Act
		Set<ConstraintViolation<CredentialDto>> violations = validator.validate(dto);

		// Assert
		assertFalse(violations.isEmpty(), "Missing 'value' should trigger validation error");
		ConstraintViolation<CredentialDto> violation = violations.iterator().next();
		assertEquals("Credential value is required", violation.getMessage(), "Validation message for 'value'");
	}

	@Test
	void testInvalidCredentialDto_MissingAllRequiredFields() {
		// Arrange
		CredentialDto dto = new CredentialDto();
		dto.setTemporary(true);

		// Act
		Set<ConstraintViolation<CredentialDto>> violations = validator.validate(dto);

		// Assert
		assertEquals(2, violations.size(), "Missing both 'type' and 'value' should trigger 2 validation errors");
	}

	@Test
	void testGetterAndSetter() {
		// Arrange
		CredentialDto dto = new CredentialDto();

		// Act
		dto.setType("password");
		dto.setValue("12345");
		dto.setTemporary(true);

		// Assert
		assertEquals("password", dto.getType(), "Getter for 'type' should return correct value");
		assertEquals("12345", dto.getValue(), "Getter for 'value' should return correct value");
		assertTrue(dto.isTemporary(), "Getter for 'temporary' should return correct value");
	}
}
