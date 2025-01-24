package lv.degra.accounting.core.freight.tracking.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Set;

import org.junit.jupiter.api.Test;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import lv.degra.accounting.core.truck.model.Truck;

class TruckTest {

	@Test
	void testNoArgsConstructorAndSetters() {
		Truck truck = new Truck();
		truck.setId(1);
		truck.setMake("Volvo");
		truck.setModel("FH16");
		truck.setRegistrationNumber("ABC123");

		assertEquals(1, truck.getId());
		assertEquals("Volvo", truck.getMake());
		assertEquals("FH16", truck.getModel());
		assertEquals("ABC123", truck.getRegistrationNumber());
	}

	@Test
	void testAllArgsConstructorAndGetters() {
		Truck truck = new Truck(1, "Volvo", "FH16", "ABC123");

		assertEquals(1, truck.getId());
		assertEquals("Volvo", truck.getMake());
		assertEquals("FH16", truck.getModel());
		assertEquals("ABC123", truck.getRegistrationNumber());
	}

	@Test
	void testToString() {
		Truck truck = new Truck(1, "Volvo", "FH16", "ABC123");
		String expectedString = "Truck{id=1, make='Volvo', model='FH16', registrationNumber='ABC123'}";

		assertEquals(expectedString, truck.toString());
	}

	@Test
	void testEqualsAndHashCode() {
		Truck truck1 = new Truck(1, "Volvo", "FH16", "ABC123");
		Truck truck2 = new Truck(1, "Volvo", "FH16", "ABC123");
		Truck truck3 = new Truck(2, "Scania", "R450", "DEF456");

		assertEquals(truck1, truck2); // Should be equal
		assertNotEquals(truck1, truck3); // Should not be equal

		assertEquals(truck1.hashCode(), truck2.hashCode());
		assertNotEquals(truck1.hashCode(), truck3.hashCode());
	}

	@Test
	void testNotNullAndSizeConstraints() {
		ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
		Validator validator = factory.getValidator();

		Truck truck = new Truck();

		// Test make - null
		truck.setMake(null);
		Set<ConstraintViolation<Truck>> violations = validator.validate(truck);
		assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("make") && v.getMessage().contains("must not be null")));

		// Test make - size
		truck.setMake("ThisIsAVeryLongTruckMakeNameExceedingLimit");
		violations = validator.validate(truck);
		assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("make") && v.getMessage().contains("size must be between 0 and 20")));

		// Test model - null
		truck.setModel(null);
		violations = validator.validate(truck);
		assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("model") && v.getMessage().contains("must not be null")));

		// Test model - size
		truck.setModel("ThisIsAVeryLongTruckModelNameExceedingLimit");
		violations = validator.validate(truck);
		assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("model") && v.getMessage().contains("size must be between 0 and 20")));

		// Test registrationNumber - null
		truck.setRegistrationNumber(null);
		violations = validator.validate(truck);
		assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("registrationNumber") && v.getMessage().contains("must not be null")));

		// Test registrationNumber - size
		truck.setRegistrationNumber("TOOLONG12345");
		violations = validator.validate(truck);
		assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("registrationNumber") && v.getMessage().contains("size must be between 0 and 10")));
	}
	@Test
	void testEquals_SameObjects() {
		Truck truck1 = new Truck(1, "Volvo", "FH16", "ABC123");
		Truck truck2 = new Truck(1, "Volvo", "FH16", "ABC123");

		assertEquals(truck1, truck2, "Equal objects should return true for equals()");
	}

	@Test
	void testEquals_DifferentObjects() {
		Truck truck1 = new Truck(1, "Volvo", "FH16", "ABC123");
		Truck truck2 = new Truck(2, "Scania", "R450", "DEF456");

		assertNotEquals(truck1, truck2, "Different objects should return false for equals()");
	}

	@Test
	void testEquals_Null() {
		Truck truck = new Truck(1, "Volvo", "FH16", "ABC123");

		assertNotEquals(truck, null, "Comparing with null should return false");
	}

	@Test
	void testEquals_DifferentClass() {
		Truck truck = new Truck(1, "Volvo", "FH16", "ABC123");

		assertNotEquals(truck, "Some String", "Comparing with a different class should return false");
	}

	@Test
	void testHashCode_SameObjects() {
		Truck truck1 = new Truck(1, "Volvo", "FH16", "ABC123");
		Truck truck2 = new Truck(1, "Volvo", "FH16", "ABC123");

		assertEquals(truck1.hashCode(), truck2.hashCode(), "Hash codes for equal objects should be the same");
	}

	@Test
	void testHashCode_DifferentObjects() {
		Truck truck1 = new Truck(1, "Volvo", "FH16", "ABC123");
		Truck truck2 = new Truck(2, "Scania", "R450", "DEF456");

		assertNotEquals(truck1.hashCode(), truck2.hashCode(), "Hash codes for different objects should be different");
	}

}
