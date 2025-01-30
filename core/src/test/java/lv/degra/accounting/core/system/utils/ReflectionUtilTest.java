package lv.degra.accounting.core.system.utils;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.sql.Date;
import java.time.LocalDate;
import java.util.Map;

import org.junit.jupiter.api.Test;

class ReflectionUtilTest {

	static class TestClass {
		private final String stringField = "testValue";
		private final int intField = 42;
		private final LocalDate localDateField = LocalDate.of(2024, 12, 1);
		private final transient String transientField = "shouldNotBeIncluded";
	}

	@Test
	void testConvertObjectToMap_AllFieldsAccessible() {
		TestClass testObject = new TestClass();
		Map<String, Object> fieldMap = ReflectionUtil.convertObjectToMap(testObject);

		assertEquals(3, fieldMap.size(), "Map should contain all accessible fields");
		assertEquals("testValue", fieldMap.get("stringField"), "String field should match");
		assertEquals(42, fieldMap.get("intField"), "Integer field should match");
		assertEquals(Date.valueOf("2024-12-01"), fieldMap.get("localDateField"), "LocalDate should be converted to SQL Date");
	}

	@Test
	void testConvertObjectToMap_EmptyObject() {
		Object emptyObject = new Object();
		Map<String, Object> fieldMap = ReflectionUtil.convertObjectToMap(emptyObject);

		assertEquals(0, fieldMap.size(), "Empty object should return an empty map");
	}

	@Test
	void testConvertObjectToMap_NullInput() {
		Map<String, Object> fieldMap = ReflectionUtil.convertObjectToMap(null);
		assertEquals(0, fieldMap.size());
	}
}
