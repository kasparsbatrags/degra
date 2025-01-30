package lv.degra.accounting.core.address.register.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;

import java.time.LocalDate;

import org.junit.jupiter.api.Test;

class AddressRegisterTest {



	@Test
	void testEqualsWithSameObject() {
		AddressRegister address = new AddressRegister(1, "Name", 1, "Active", LocalDate.now(), 0);
		assertEquals(address, address);
	}

	@Test
	void testEqualsWithNull() {
		AddressRegister address = new AddressRegister(1, "Name", 1, "Active", LocalDate.now(), 0);
		assertNotEquals(address, null);
	}

	@Test
	void testEqualsWithDifferentClass() {
		AddressRegister address = new AddressRegister(1, "Name", 1, "Active", LocalDate.now(), 0);
		assertNotEquals(address, "SomeString");
	}

	@Test
	void testEqualsWithDifferentId() {
		AddressRegister address1 = new AddressRegister(1, "Name", 1, "Active", LocalDate.now(), 0);
		AddressRegister address2 = new AddressRegister(1, "Name", 1, "Active", LocalDate.now(), 0);
		address1.setId(1);
		address2.setId(2);
		assertNotEquals(address1, address2);
	}

	@Test
	void testEqualsWithDifferentCode() {
		AddressRegister address1 = new AddressRegister(1, "Name", 1, "Active", LocalDate.now(), 0);
		AddressRegister address2 = new AddressRegister(2, "Name", 1, "Active", LocalDate.now(), 0);
		assertNotEquals(address1, address2);
	}

	@Test
	void testEqualsWithDifferentType() {
		AddressRegister address1 = new AddressRegister(1, "Name", 1, "Active", LocalDate.now(), 0);
		AddressRegister address2 = new AddressRegister(1, "Name", 2, "Active", LocalDate.now(), 0);
		assertNotEquals(address1, address2);
	}

	@Test
	void testEqualsWithDifferentStatus() {
		AddressRegister address1 = new AddressRegister(1, "Name", 1, "Active", LocalDate.now(), 0);
		AddressRegister address2 = new AddressRegister(1, "Name", 1, "Inactive", LocalDate.now(), 0);
		assertNotEquals(address1, address2);
	}

	@Test
	void testEqualsWithDifferentParentCode() {
		AddressRegister address1 = new AddressRegister(1, "Name", 1, "Active", LocalDate.now(), 0);
		AddressRegister address2 = new AddressRegister(1, "Name", 1, "Active", LocalDate.now(), 1);
		assertNotEquals(address1, address2);
	}

	@Test
	void testEqualsWithDifferentName() {
		AddressRegister address1 = new AddressRegister(1, "Name1", 1, "Active", LocalDate.now(), 0);
		AddressRegister address2 = new AddressRegister(1, "Name2", 1, "Active", LocalDate.now(), 0);
		assertNotEquals(address1, address2);
	}

	@Test
	void testEqualsWithIdenticalObjects() {
		AddressRegister address1 = new AddressRegister(1, "Name", 1, "Active", LocalDate.now(), 0);
		AddressRegister address2 = new AddressRegister(1, "Name", 1, "Active", LocalDate.now(), 0);
		assertEquals(address1, address2);
	}

	@Test
	void testHashCodeWithDifferentObjects() {
		AddressRegister address1 = new AddressRegister(1, "Name1", 1, "Active", LocalDate.now(), 0);
		AddressRegister address2 = new AddressRegister(2, "Name2", 1, "Inactive", LocalDate.now(), 0);
		assertNotEquals(address1.hashCode(), address2.hashCode());
	}

	@Test
	void testToString() {
		AddressRegister address = new AddressRegister(1, "Name", 1, "Active", LocalDate.now(), 0);
		address.setId(1);
		address.setFullAddress("Full Address");
		String expected = "AddressRegister{id=1, code=1, type=1, status='Active', parentCode=0, parentType=null, name='Name', " +
				"sortName='null', zip='null', dateFrom=" + LocalDate.now() + ", updateDatePublic=null, dateTo=null, " +
				"fullAddress='Full Address', territorialUnitCode=null}";
		assertEquals(expected, address.toString());
	}

	@Test
	void testConstructor() {
		AddressRegister address = new AddressRegister(1, "Name", 1, "Active", LocalDate.now(), 0);
		assertEquals(1, address.getCode());
		assertEquals("Name", address.getName());
		assertEquals(1, address.getType());
		assertEquals("Active", address.getStatus());
		assertEquals(0, address.getParentCode());
		assertEquals(LocalDate.now(), address.getDateFrom());
	}

	@Test
	void testGetterAndSetter() {
		AddressRegister address = new AddressRegister();
		address.setId(1);
		address.setCode(101);
		address.setName("Test Name");
		address.setType(2);
		address.setStatus("Active");
		address.setParentCode(100);
		address.setParentType(1);
		address.setSortName("SortName");
		address.setZip("12345");
		address.setDateFrom(LocalDate.of(2023, 1, 1));
		address.setUpdateDatePublic(LocalDate.of(2023, 1, 2));
		address.setDateTo(LocalDate.of(2023, 12, 31));
		address.setFullAddress("Full Address");
		address.setTerritorialUnitCode(123);

		assertEquals(1, address.getId());
		assertEquals(101, address.getCode());
		assertEquals("Test Name", address.getName());
		assertEquals(2, address.getType());
		assertEquals("Active", address.getStatus());
		assertEquals(100, address.getParentCode());
		assertEquals(1, address.getParentType());
		assertEquals("SortName", address.getSortName());
		assertEquals("12345", address.getZip());
		assertEquals(LocalDate.of(2023, 1, 1), address.getDateFrom());
		assertEquals(LocalDate.of(2023, 1, 2), address.getUpdateDatePublic());
		assertEquals(LocalDate.of(2023, 12, 31), address.getDateTo());
		assertEquals("Full Address", address.getFullAddress());
		assertEquals(123, address.getTerritorialUnitCode());
	}

}
