package lv.degra.accounting.core.address.register.model;

import static lv.degra.accounting.core.document.dataFactories.CustomersData.getCustomer1;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

import org.junit.jupiter.api.Test;

import lv.degra.accounting.core.address.model.Address;
import lv.degra.accounting.core.customer.model.Customer;

class AddressTest {

	@Test
	void testAddressConstructorAndGetters() {
		LocalDate dateFrom = LocalDate.of(2023, 12, 1);
		Address address = new Address(1, "Test Name", 2, "Active", dateFrom);

		assertEquals(1, address.getCode());
		assertEquals("Test Name", address.getName());
		assertEquals(2, address.getType());
		assertEquals("Active", address.getStatus());
		assertEquals(dateFrom, address.getDateFrom());
	}

	@Test
	void testAddressSetters() {
		Address address = new Address();
		address.setId(1);
		address.setCode(123);
		address.setType(2);
		address.setStatus("Active");
		address.setParentCode(10);
		address.setParentType(5);
		address.setName("New Name");
		address.setSortByValue("SortValue");
		address.setZip("LV-1234");
		address.setDateFrom(LocalDate.of(2023, 1, 1));
		address.setUpdateDatePublic(LocalDate.of(2023, 2, 1));
		address.setDateTo(LocalDate.of(2024, 1, 1));
		address.setFullAddress("Full Address");
		address.setTerritorialUnitCode(300);

		assertEquals(1, address.getId());
		assertEquals(123, address.getCode());
		assertEquals(2, address.getType());
		assertEquals("Active", address.getStatus());
		assertEquals(10, address.getParentCode());
		assertEquals(5, address.getParentType());
		assertEquals("New Name", address.getName());
		assertEquals("SortValue", address.getSortByValue());
		assertEquals("LV-1234", address.getZip());
		assertEquals(LocalDate.of(2023, 1, 1), address.getDateFrom());
		assertEquals(LocalDate.of(2023, 2, 1), address.getUpdateDatePublic());
		assertEquals(LocalDate.of(2024, 1, 1), address.getDateTo());
		assertEquals("Full Address", address.getFullAddress());
		assertEquals(300, address.getTerritorialUnitCode());
	}

	@Test
	void testEqualsAndHashCode() {
		Address address1 = new Address(1, "Test Name", 2, "Active", LocalDate.of(2023, 1, 1));
		Address address2 = new Address(1, "Test Name", 2, "Active", LocalDate.of(2023, 1, 1));

		assertEquals(address1, address2);
		assertEquals(address1.hashCode(), address2.hashCode());

		address2.setName("Different Name");
		assertNotEquals(address1, address2);
	}

	@Test
	void testOneToManyRelationship() {
		Address address = new Address();
		Customer customer1 = getCustomer1();
		Customer customer2 = new Customer();

		Set<Customer> customers = new HashSet<>();
		customers.add(customer1);
		customers.add(customer2);

		address.setCustomers(customers);

		assertEquals(2, address.getCustomers().size());
		assertTrue(address.getCustomers().contains(customer1));
		assertTrue(address.getCustomers().contains(customer2));
	}

	@Test
	void testEmptyConstructor() {
		Address address = new Address();
		assertNull(address.getId());
		assertNull(address.getCode());
		assertNull(address.getType());
		assertNull(address.getStatus());
		assertNull(address.getName());
		assertNull(address.getDateFrom());
	}


	@Test
	void testEquals_NullObject() {
		Address address = new Address();
		assertNotEquals(null, address, "Address should not be equal to null");
	}

	@Test
	void testEquals_DifferentClass() {
		Address address = new Address();
		String otherClassObject = "Not an Address";
		assertNotEquals(address, otherClassObject, "Address should not be equal to an object of a different class");
	}

	@Test
	void testEquals_SameObject() {
		Address address = new Address();
		assertEquals(address, address, "Address should be equal to itself");
	}

	@Test
	void testEquals_EqualObjects() {
		Address address1 = new Address();
		address1.setId(1);
		address1.setCode(123);
		address1.setType(2);
		address1.setStatus("Active");

		Address address2 = new Address();
		address2.setId(1);
		address2.setCode(123);
		address2.setType(2);
		address2.setStatus("Active");

		assertEquals(address1, address2, "Addresses with the same values should be equal");
	}

	@Test
	void testEquals_NotEqualObjects() {
		Address address1 = new Address();
		address1.setId(1);
		address1.setCode(123);

		Address address2 = new Address();
		address2.setId(2); // Different ID
		address2.setCode(123);

		assertNotEquals(address1, address2, "Addresses with different IDs should not be equal");
	}

	@Test
	void testEquals_CustomersField() {
		Address address1 = new Address();
		Address address2 = new Address();

		Set<Customer> customers1 = new HashSet<>();
		Set<Customer> customers2 = new HashSet<>();

		Customer customer1 = new Customer();
		customer1.setId(1);
		customers1.add(customer1);

		Customer customer2 = new Customer();
		customer2.setId(2);
		customers2.add(customer2);

		address1.setCustomers(customers1);
		address2.setCustomers(customers2);

		assertNotEquals(address1, address2, "Addresses with different customers should not be equal");
	}

	@Test
	void testEquals_SameId() {
		Address address1 = new Address();
		Address address2 = new Address();

		address1.setId(1);
		address2.setId(1);

		assertEquals(address1, address2, "Addresses with the same ID should be equal");
	}

	@Test
	void testEquals_DifferentId() {
		Address address1 = new Address();
		Address address2 = new Address();

		address1.setId(1);
		address2.setId(2);

		assertNotEquals(address1, address2, "Addresses with different IDs should not be equal");
	}

	@Test
	void testEquals_SameCode() {
		Address address1 = new Address();
		Address address2 = new Address();

		address1.setCode(123);
		address2.setCode(123);

		assertEquals(address1, address2, "Addresses with the same code should be equal");
	}

	@Test
	void testEquals_DifferentCode() {
		Address address1 = new Address();
		Address address2 = new Address();

		address1.setCode(123);
		address2.setCode(456);

		assertNotEquals(address1, address2, "Addresses with different codes should not be equal");
	}

	@Test
	void testEquals_SameType() {
		Address address1 = new Address();
		Address address2 = new Address();

		address1.setType(1);
		address2.setType(1);

		assertEquals(address1, address2, "Addresses with the same type should be equal");
	}

	@Test
	void testEquals_DifferentType() {
		Address address1 = new Address();
		Address address2 = new Address();

		address1.setType(1);
		address2.setType(2);

		assertNotEquals(address1, address2, "Addresses with different types should not be equal");
	}

	@Test
	void testEquals_SameStatus() {
		Address address1 = new Address();
		Address address2 = new Address();

		address1.setStatus("Active");
		address2.setStatus("Active");

		assertEquals(address1, address2, "Addresses with the same status should be equal");
	}

	@Test
	void testEquals_DifferentStatus() {
		Address address1 = new Address();
		Address address2 = new Address();

		address1.setStatus("Active");
		address2.setStatus("Inactive");

		assertNotEquals(address1, address2, "Addresses with different statuses should not be equal");
	}

	@Test
	void testEquals_SameParentCode() {
		Address address1 = new Address();
		Address address2 = new Address();

		address1.setParentCode(1);
		address2.setParentCode(1);

		assertEquals(address1, address2, "Addresses with the same parent code should be equal");
	}

	@Test
	void testEquals_DifferentParentCode() {
		Address address1 = new Address();
		Address address2 = new Address();

		address1.setParentCode(1);
		address2.setParentCode(2);

		assertNotEquals(address1, address2, "Addresses with different parent codes should not be equal");
	}

	@Test
	void testEquals_SameFullAddress() {
		Address address1 = new Address();
		Address address2 = new Address();

		address1.setFullAddress("123 Main St");
		address2.setFullAddress("123 Main St");

		assertEquals(address1, address2, "Addresses with the same full address should be equal");
	}

	@Test
	void testEquals_DifferentFullAddress() {
		Address address1 = new Address();
		Address address2 = new Address();

		address1.setFullAddress("123 Main St");
		address2.setFullAddress("456 Elm St");

		assertNotEquals(address1, address2, "Addresses with different full addresses should not be equal");
	}

	@Test
	void testEquals_SameDateFromAndDateTo() {
		Address address1 = new Address();
		Address address2 = new Address();

		LocalDate dateFrom = LocalDate.of(2023, 1, 1);
		LocalDate dateTo = LocalDate.of(2023, 12, 31);

		address1.setDateFrom(dateFrom);
		address2.setDateFrom(dateFrom);

		address1.setDateTo(dateTo);
		address2.setDateTo(dateTo);

		assertEquals(address1, address2, "Addresses with the same dateFrom and dateTo should be equal");
	}

	@Test
	void testEquals_DifferentDateFromAndDateTo() {
		Address address1 = new Address();
		Address address2 = new Address();

		address1.setDateFrom(LocalDate.of(2023, 1, 1));
		address2.setDateFrom(LocalDate.of(2024, 1, 1));

		address1.setDateTo(LocalDate.of(2023, 12, 31));
		address2.setDateTo(LocalDate.of(2024, 12, 31));

		assertNotEquals(address1, address2, "Addresses with different dateFrom and dateTo should not be equal");
	}

	@Test
	void testEquals_SameCustomers() {
		Address address1 = new Address();
		Address address2 = new Address();

		Set<Customer> customers = new HashSet<>();
		Customer customer = new Customer();
		customer.setId(1);
		customers.add(customer);

		address1.setCustomers(customers);
		address2.setCustomers(customers);

		assertEquals(address1, address2, "Addresses with the same customers should be equal");
	}

	@Test
	void testEquals_DifferentCustomers() {
		Address address1 = new Address();
		Address address2 = new Address();

		Set<Customer> customers1 = new HashSet<>();
		Customer customer1 = new Customer();
		customer1.setId(1);
		customers1.add(customer1);

		Set<Customer> customers2 = new HashSet<>();
		Customer customer2 = new Customer();
		customer2.setId(2);
		customers2.add(customer2);

		address1.setCustomers(customers1);
		address2.setCustomers(customers2);

		assertNotEquals(address1, address2, "Addresses with different customers should not be equal");
	}

}
