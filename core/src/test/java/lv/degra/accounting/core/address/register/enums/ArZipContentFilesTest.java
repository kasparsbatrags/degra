package lv.degra.accounting.core.address.register.enums;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import org.junit.jupiter.api.Test;

import lv.degra.accounting.core.address.register.model.City;
import lv.degra.accounting.core.address.register.model.CommonData;
import lv.degra.accounting.core.address.register.model.Region;

class ArZipContentFilesTest {

	@Test
	void testEnumValues() {
		// Test ADDRESS_ZIP_FILE_CONTENT_COUNTIES
		ArZipContentFiles counties = ArZipContentFiles.ADDRESS_ZIP_FILE_CONTENT_COUNTIES;
		assertNotNull(counties, "ADDRESS_ZIP_FILE_CONTENT_COUNTIES should not be null");
		assertEquals("AW_NOVADS.CSV", counties.getFileName(), "File name for counties should be 'AW_NOVADS.CSV'");
		assertEquals(Region.class, counties.getClasName(), "Class name for counties should be Region.class");

		// Test ADDRESS_ZIP_FILE_CONTENT_CITIES
		ArZipContentFiles cities = ArZipContentFiles.ADDRESS_ZIP_FILE_CONTENT_CITIES;
		assertNotNull(cities, "ADDRESS_ZIP_FILE_CONTENT_CITIES should not be null");
		assertEquals("AW_PILSETA.CSV", cities.getFileName(), "File name for cities should be 'AW_PILSETA.CSV'");
		assertEquals(City.class, cities.getClasName(), "Class name for cities should be City.class");

		// Test ADDRESS_ZIP_FILE_CONTENT_PARISHES
		ArZipContentFiles parishes = ArZipContentFiles.ADDRESS_ZIP_FILE_CONTENT_PARISHES;
		assertNotNull(parishes, "ADDRESS_ZIP_FILE_CONTENT_PARISHES should not be null");
		assertEquals("AW_PAGASTS.CSV", parishes.getFileName(), "File name for parishes should be 'AW_PAGASTS.CSV'");
		assertEquals(CommonData.class, parishes.getClasName(), "Class name for parishes should be CommonData.class");

		// Repeat similar tests for all other enum constants...
	}

	@Test
	void testEnumIntegrity() {
		// Ensure all enum values are present and unique
		ArZipContentFiles[] values = ArZipContentFiles.values();
		assertEquals(7, values.length, "There should be 7 ArZipContentFiles values");
		assertArrayEquals(
				new ArZipContentFiles[]{
						ArZipContentFiles.ADDRESS_ZIP_FILE_CONTENT_COUNTIES,
						ArZipContentFiles.ADDRESS_ZIP_FILE_CONTENT_CITIES,
						ArZipContentFiles.ADDRESS_ZIP_FILE_CONTENT_PARISHES,
						ArZipContentFiles.ADDRESS_ZIP_FILE_CONTENT_VILLAGES,
						ArZipContentFiles.ADDRESS_ZIP_FILE_CONTENT_STREETS,
						ArZipContentFiles.ADDRESS_ZIP_FILE_CONTENT_BUILDINGS,
						ArZipContentFiles.ADDRESS_ZIP_FILE_CONTENT_FLATS
				},
				values,
				"Enum values are not as expected"
		);
	}
}
