package lv.degra.accounting.core.country;

import static org.junit.jupiter.api.Assertions.*;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import jakarta.validation.ConstraintViolation;
import lv.degra.accounting.core.country.model.Country;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Set;

class CountryTest {

	private Country country;
	private Validator validator;

	@BeforeEach
	void setUp() {
		country = new Country();
		ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
		validator = factory.getValidator();
	}

	@Test
	void testGettersAndSetters() {
		country.setId(1);
		assertEquals(1, country.getId());

		country.setName("Latvia");
		assertEquals("Latvia", country.getName());

		country.setOfficialStateName("LV");
		assertEquals("LV", country.getOfficialStateName());

		country.setAlpha2Code("LV");
		assertEquals("LV", country.getAlpha2Code());

		LocalDate date = LocalDate.of(2023, 9, 25);
		country.setAlpha3Code(date);
		assertEquals(date, country.getAlpha3Code());

		Instant createdAt = Instant.now();
		country.setCreatedAt(createdAt);
		assertEquals(createdAt, country.getCreatedAt());

		Instant lastModifiedAt = Instant.now();
		country.setLastModifiedAt(lastModifiedAt);
		assertEquals(lastModifiedAt, country.getLastModifiedAt());
	}

	@Test
	void testValidationConstraints() {
		country.setId(null);
		country.setName(null);
		country.setAlpha2Code(null);
		country.setAlpha3Code(null);

		Set<ConstraintViolation<Country>> violations = validator.validate(country);

		assertFalse(violations.isEmpty());

		violations.forEach(violation -> {
			String propertyPath = violation.getPropertyPath().toString();
			if ("id".equals(propertyPath)) {
				assertEquals("must not be null", violation.getMessage());
			} else if ("name".equals(propertyPath)) {
				assertEquals("must not be null", violation.getMessage());
			} else if ("alpha2Code".equals(propertyPath)) {
				assertEquals("must not be null", violation.getMessage());
			} else if ("alpha3Code".equals(propertyPath)) {
				assertEquals("must not be null", violation.getMessage());
			}
		});
	}
}
