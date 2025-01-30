package lv.degra.accounting.core.address.register.enums;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import org.junit.jupiter.api.Test;

class AddressTypeTest {

	@Test
	void testEnumValues() {
		// Test CITY enum
		AddressType city = AddressType.CITY;
		assertNotNull(city, "CITY should not be null");
		assertEquals(104, city.getValue(), "CITY value should be 104");

		// Test REGION enum
		AddressType region = AddressType.REGION;
		assertNotNull(region, "REGION should not be null");
		assertEquals(113, region.getValue(), "REGION value should be 113");

		// Test PARISH enum
		AddressType parish = AddressType.PARISH;
		assertNotNull(parish, "PARISH should not be null");
		assertEquals(105, parish.getValue(), "PARISH value should be 105");
	}

	@Test
	void testEnumIntegrity() {
		// Ensure all enum values are present and unique
		AddressType[] values = AddressType.values();
		assertEquals(3, values.length, "There should be 3 AddressType values");
		assertArrayEquals(new AddressType[]{AddressType.CITY, AddressType.REGION, AddressType.PARISH}, values, "Enum values are not as expected");
	}
}
