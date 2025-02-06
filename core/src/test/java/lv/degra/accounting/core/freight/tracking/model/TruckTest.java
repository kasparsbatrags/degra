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
		truck.setFuelConsumptionNorm(30.5);

		assertEquals(1, truck.getId());
		assertEquals("Volvo", truck.getMake());
		assertEquals("FH16", truck.getModel());
		assertEquals("ABC123", truck.getRegistrationNumber());
		assertEquals(30.5, truck.getFuelConsumptionNorm());
	}

	@Test
	void testAllArgsConstructorAndGetters() {
		Truck truck = new Truck(1, "Volvo", "FH16", "ABC123", 30.5);

		assertEquals(1, truck.getId());
		assertEquals("Volvo", truck.getMake());
		assertEquals("FH16", truck.getModel());
		assertEquals("ABC123", truck.getRegistrationNumber());
		assertEquals(30.5, truck.getFuelConsumptionNorm());
	}

	@Test
	void testToString() {
		Truck truck = new Truck(1, "Volvo", "FH16", "ABC123", 30.5);
		String expectedString = "Truck{id=1, make='Volvo', model='FH16', registrationNumber='ABC123', fuelConsumptionNorm=30.5}";

		assertEquals(expectedString, truck.toString());
	}

	@Test
	void testEqualsAndHashCode() {
		Truck truck1 = new Truck(1, "Volvo", "FH16", "ABC123", 30.5);
		Truck truck2 = new Truck(1, "Volvo", "FH16", "ABC123", 30.5);
		Truck truck3 = new Truck(2, "Scania", "R450", "DEF456", 25.0);

		// Test equal objects
		assertEquals(truck1, truck2); // Should be equal
		assertNotEquals(truck1, truck3); // Should not be equal

		// Test with different fuel consumption but same other fields
		Truck truck4 = new Truck(1, "Volvo", "FH16", "ABC123", 35.0);
		assertNotEquals(truck1, truck4); // Should not be equal due to different fuel consumption

		// Test hash codes
		assertEquals(truck1.hashCode(), truck2.hashCode());
		assertNotEquals(truck1.hashCode(), truck3.hashCode());
		assertNotEquals(truck1.hashCode(), truck4.hashCode());
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

		// Test fuelConsumptionNorm - null
		truck.setFuelConsumptionNorm(null);
		violations = validator.validate(truck);
		assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("fuelConsumptionNorm") && v.getMessage().contains("must not be null")));
	}
	@Test
	void testEquals_SameObjects() {
		Truck truck1 = new Truck(1, "Volvo", "FH16", "ABC123", 30.5);
		Truck truck2 = new Truck(1, "Volvo", "FH16", "ABC123", 30.5);

		assertEquals(truck1, truck2, "Equal objects should return true for equals()");
	}

	@Test
	void testEquals_DifferentObjects() {
		Truck truck1 = new Truck(1, "Volvo", "FH16", "ABC123", 30.5);
		Truck truck2 = new Truck(2, "Scania", "R450", "DEF456", 25.0);

		assertNotEquals(truck1, truck2, "Different objects should return false for equals()");
	}

	@Test
	void testEquals_Null() {
		Truck truck = new Truck(1, "Volvo", "FH16", "ABC123", 30.5);

		assertNotEquals(truck, null, "Comparing with null should return false");
	}

	@Test
	void testEquals_DifferentClass() {
		Truck truck = new Truck(1, "Volvo", "FH16", "ABC123", 30.5);

		assertNotEquals(truck, "Some String", "Comparing with a different class should return false");
	}

	@Test
	void testHashCode_SameObjects() {
		Truck truck1 = new Truck(1, "Volvo", "FH16", "ABC123", 30.5);
		Truck truck2 = new Truck(1, "Volvo", "FH16", "ABC123", 30.5);

		assertEquals(truck1.hashCode(), truck2.hashCode(), "Hash codes for equal objects should be the same");
	}

	@Test
	void testHashCode_DifferentObjects() {
		Truck truck1 = new Truck(1, "Volvo", "FH16", "ABC123", 30.5);
		Truck truck2 = new Truck(2, "Scania", "R450", "DEF456", 25.0);

		assertNotEquals(truck1.hashCode(), truck2.hashCode(), "Hash codes for different objects should be different");
	}

}
