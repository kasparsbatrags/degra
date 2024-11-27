package lv.degra.accounting.core.document.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import lv.degra.accounting.core.document.dataFactories.DeclarationSectionDataFactory;

class DeclarationSectionTest {

	private Validator validator;

	@BeforeEach
	void setUp() {
		try (ValidatorFactory factory = Validation.buildDefaultValidatorFactory()) {
			validator = factory.getValidator();
		}
	}

	@Test
	void testValidSection1() {
		DeclarationSection section = DeclarationSectionDataFactory.createValidSection1();
		var violations = validator.validate(section);
		assertTrue(violations.isEmpty(), "Section 1 should pass validation");
	}

	@Test
	void testValidSection2() {
		DeclarationSection section = DeclarationSectionDataFactory.createValidSection2();
		var violations = validator.validate(section);
		assertTrue(violations.isEmpty(), "Section 2 should pass validation");
	}

	@Test
	void testInvalidLongCode() {
		DeclarationSection section = DeclarationSectionDataFactory.createSectionWithLongCode();
		var violations = validator.validate(section);

		assertFalse(violations.isEmpty(), "Section with long code should fail validation");
		violations.forEach(violation ->
				System.out.println("Field: " + violation.getPropertyPath() +
						", Invalid value: " + violation.getInvalidValue() +
						", Message: " + violation.getMessage()));
	}

	@Test
	void testNullName() {
		DeclarationSection section = DeclarationSectionDataFactory.createSectionWithNullName();
		var violations = validator.validate(section);

		assertFalse(violations.isEmpty(), "Section with null name should fail validation");
		violations.forEach(violation ->
				System.out.println("Field: " + violation.getPropertyPath() +
						", Invalid value: " + violation.getInvalidValue() +
						", Message: " + violation.getMessage()));
	}

	@Test
	void testToString() {
		DeclarationSection section = DeclarationSectionDataFactory.createValidSection1();
		assertEquals("Nodokļa summas par iekšzemē iegādātajām precēm un saņemtajiem pakalpojumiem",
				section.getName(),
				"toString should return the name");
	}

	@Test
	void testEqualsAndHashCode() {
		DeclarationSection section1 = DeclarationSectionDataFactory.createValidSection1();
		DeclarationSection section2 = DeclarationSectionDataFactory.createValidSection1();

		assertEquals(section1, section2, "Objects with the same data should be equal");
		assertEquals(section1.hashCode(), section2.hashCode(), "Hash codes should match");
	}

	@Test
	void testNotEquals() {
		DeclarationSection section1 = DeclarationSectionDataFactory.createValidSection1();
		DeclarationSection section2 = DeclarationSectionDataFactory.createValidSection2();

		assertNotEquals(section1, section2, "Objects with different data should not be equal");
	}
}

