package lv.degra.accounting.core.address.register.enums;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

class ArRecordStatusTest {

	@Test
	void testEnumValues() {
		// Test EXIST constant
		ArRecordStatus exist = ArRecordStatus.EXIST;
		assertNotNull(exist, "EXIST should not be null");
		assertEquals("EKS", exist.getCode(), "EXIST code should be 'EKS'");
		assertEquals(1, exist.getStatusOnSystem(), "EXIST statusOnSystem should be 1");

		// Test DELETED constant
		ArRecordStatus deleted = ArRecordStatus.DELETED;
		assertNotNull(deleted, "DELETED should not be null");
		assertEquals("DEL", deleted.getCode(), "DELETED code should be 'DEL'");
		assertEquals(2, deleted.getStatusOnSystem(), "DELETED statusOnSystem should be 2");

		// Test STATUS_ERROR constant
		ArRecordStatus statusError = ArRecordStatus.STATUS_ERROR;
		assertNotNull(statusError, "STATUS_ERROR should not be null");
		assertEquals("ERR", statusError.getCode(), "STATUS_ERROR code should be 'ERR'");
		assertEquals(3, statusError.getStatusOnSystem(), "STATUS_ERROR statusOnSystem should be 3");
	}

	@Test
	void testGetStatusOnSystemByCode() {
		// Valid codes
		assertEquals(1, ArRecordStatus.getStatusOnSystemByCode("EKS"), "Code 'EKS' should return 1");
		assertEquals(2, ArRecordStatus.getStatusOnSystemByCode("DEL"), "Code 'DEL' should return 2");
		assertEquals(3, ArRecordStatus.getStatusOnSystemByCode("ERR"), "Code 'ERR' should return 3");

		// Case insensitivity
		assertEquals(1, ArRecordStatus.getStatusOnSystemByCode("eks"), "Code 'eks' (lowercase) should return 1");

		// Invalid code
		Exception exception = assertThrows(IllegalArgumentException.class,
				() -> ArRecordStatus.getStatusOnSystemByCode("INVALID"),
				"Invalid code should throw IllegalArgumentException");
		assertEquals("Invalid code: INVALID", exception.getMessage());
	}

	@Test
	void testEnumIntegrity() {
		// Ensure all enum values are present and unique
		ArRecordStatus[] values = ArRecordStatus.values();
		assertEquals(3, values.length, "There should be 3 ArRecordStatus values");
		assertArrayEquals(new ArRecordStatus[]{ArRecordStatus.EXIST, ArRecordStatus.DELETED, ArRecordStatus.STATUS_ERROR}, values, "Enum values are not as expected");
	}
}
