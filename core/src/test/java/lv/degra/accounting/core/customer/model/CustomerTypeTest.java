package lv.degra.accounting.core.customer.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;

import org.junit.jupiter.api.Test;

class CustomerTypeTest {

	@Test
	void testSettersAndGetters() {
		CustomerType customerType = new CustomerType();
		customerType.setId(1);
		customerType.setName("Corporate");

		assertEquals(1, customerType.getId());
		assertEquals("Corporate", customerType.getName());
	}

	@Test
	void testEqualsSameObject() {
		CustomerType customerType = new CustomerType();
		customerType.setId(1);
		customerType.setName("Corporate");

		assertEquals(customerType, customerType);
	}

	@Test
	void testEqualsNullObject() {
		CustomerType customerType = new CustomerType();
		customerType.setId(1);
		customerType.setName("Corporate");

		assertNotEquals(customerType, null);
	}

	@Test
	void testEqualsDifferentClass() {
		CustomerType customerType = new CustomerType();
		customerType.setId(1);
		customerType.setName("Corporate");

		assertNotEquals(customerType, "String");
	}

	@Test
	void testEqualsEqualObjects() {
		CustomerType customerType1 = new CustomerType();
		customerType1.setId(1);
		customerType1.setName("Corporate");

		CustomerType customerType2 = new CustomerType();
		customerType2.setId(1);
		customerType2.setName("Corporate");

		assertEquals(customerType1, customerType2);
	}

	@Test
	void testEqualsDifferentId() {
		CustomerType customerType1 = new CustomerType();
		customerType1.setId(1);
		customerType1.setName("Corporate");

		CustomerType customerType2 = new CustomerType();
		customerType2.setId(2);
		customerType2.setName("Corporate");

		assertNotEquals(customerType1, customerType2);
	}

	@Test
	void testEqualsDifferentName() {
		CustomerType customerType1 = new CustomerType();
		customerType1.setId(1);
		customerType1.setName("Corporate");

		CustomerType customerType2 = new CustomerType();
		customerType2.setId(1);
		customerType2.setName("Individual");

		assertNotEquals(customerType1, customerType2);
	}

	@Test
	void testHashCodeEqualObjects() {
		CustomerType customerType1 = new CustomerType();
		customerType1.setId(1);
		customerType1.setName("Corporate");

		CustomerType customerType2 = new CustomerType();
		customerType2.setId(1);
		customerType2.setName("Corporate");

		assertEquals(customerType1.hashCode(), customerType2.hashCode());
	}

	@Test
	void testHashCodeDifferentObjects() {
		CustomerType customerType1 = new CustomerType();
		customerType1.setId(1);
		customerType1.setName("Corporate");

		CustomerType customerType2 = new CustomerType();
		customerType2.setId(2);
		customerType2.setName("Individual");

		assertNotEquals(customerType1.hashCode(), customerType2.hashCode());
	}
}
