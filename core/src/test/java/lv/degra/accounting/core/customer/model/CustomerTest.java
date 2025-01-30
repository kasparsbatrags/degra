package lv.degra.accounting.core.customer.model;

import static lv.degra.accounting.core.customer.CustomersData.getCustomer1;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import lv.degra.accounting.core.address.model.Address;

public class CustomerTest {

	private Customer customer;
	private CustomerType customerType;
	private Address address;
	private Validator validator;

	@BeforeEach
	public void setUp() {
		try (ValidatorFactory factory = Validation.buildDefaultValidatorFactory()) {
			validator = factory.getValidator();
		}
		customer = getCustomer1();
		customerType = new CustomerType();
		address = new Address();
	}

	@Test
	public void testGettersAndSetters() {
		// Arrange
		Integer id = 1;
		String name = "Test Customer";
		String registrationNumber = "123456789";
		String vatNumber = "LV123456789";

		// Act
		customer.setId(id);
		customer.setName(name);
		customer.setRegistrationNumber(registrationNumber);
		customer.setVatNumber(vatNumber);
		customer.setCustomerType(customerType);
		customer.setAddress(address);

		// Assert
		assertEquals(id, customer.getId());
		assertEquals(name, customer.getName());
		assertEquals(registrationNumber, customer.getRegistrationNumber());
		assertEquals(vatNumber, customer.getVatNumber());
		assertEquals(customerType, customer.getCustomerType());
		assertEquals(address, customer.getAddress());
	}

	@Test
	public void testToString() {
		// Arrange
		customer.setName("Test Customer");
		customer.setRegistrationNumber("123456789");

		// Act & Assert
		assertEquals("Test Customer 123456789", customer.toString());
	}

	@Test
	public void testEqualsAndHashCode() {
		// Arrange
		Customer customer1 = new Customer();
		Customer customer2 = new Customer();
		Integer id = 1;
		customer1.setId(id);
		customer2.setId(id);

		// Act & Assert
		assertEquals(customer1, customer2);
		assertEquals(customer1.hashCode(), customer2.hashCode());

		customer2.setId(2);
		assertNotEquals(customer1, customer2);
		assertNotEquals(customer1.hashCode(), customer2.hashCode());
	}

	@Test
	public void testInitialValues() {
		// Assert initial values are null
		Customer customerEmpty = new Customer();
		assertNull(customerEmpty.getId());
		assertNull(customerEmpty.getName());
		assertNull(customerEmpty.getRegistrationNumber());
		assertNull(customerEmpty.getVatNumber());
		assertNull(customerEmpty.getCustomerType());
		assertNull(customerEmpty.getAddress());
	}

	@Test
	public void testNameLengthValidation() {
		// Arrange
		String validName = "A valid customer name";
		String validRegistrationNumber = "123456789012345";
		String invalidName = """
				!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
				A very long customer name that exceeds the maximum length allowed by the constraints which is 250 characters.
				This is to check whether the validation works correctly in preventing excessively long names.
				!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		""";

		// Act
		customer.setName(validName);
		customer.setRegistrationNumber(validRegistrationNumber);
		customer.setCustomerType(customer.getCustomerType());
		Set<ConstraintViolation<Customer>> violations = validator.validate(customer);
		assertTrue(violations.isEmpty(), "Name should be valid");

		customer.setName(invalidName);
		violations = validator.validate(customer);
		if (!violations.isEmpty()) {
			violations.forEach(v -> System.out.println(v.getPropertyPath() + ": " + v.getMessage()));
		}
		assertFalse(violations.isEmpty(), "Name should not exceed 250 characters");
	}

	@Test
	public void testRegistrationNumberLengthValidation() {
		// Arrange
		String validRegistrationNumber = "123456789012345";
		String invalidRegistrationNumber = "1234567890123456"; // Exceeds max length of 15

		// Act
		customer.setRegistrationNumber(validRegistrationNumber);
		Set<ConstraintViolation<Customer>> violations = validator.validate(customer);
		assertTrue(violations.isEmpty(), "Registration number should be valid");

		customer.setRegistrationNumber(invalidRegistrationNumber);
		violations = validator.validate(customer);
		assertFalse(violations.isEmpty(), "Registration number should not exceed 15 characters");
	}
}
