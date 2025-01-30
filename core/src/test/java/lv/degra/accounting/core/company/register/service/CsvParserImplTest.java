package lv.degra.accounting.core.company.register.service;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.io.StringReader;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.MockitoAnnotations;

class CsvParserImplTest {

	@InjectMocks
	private CsvParserImpl csvParser;

	@BeforeEach
	void setUp() {
		MockitoAnnotations.openMocks(this);
	}

	@Test
	void testGetDataLines_SingleLine() {
		String csvData = "Name;Age;City\nJohn Doe;30;New York";
		StringReader reader = new StringReader(csvData);

		List<String[]> result = csvParser.getDataLines(reader);

		assertEquals(1, result.size());
		assertEquals("John Doe", result.get(0)[0]);
		assertEquals("30", result.get(0)[1]);
		assertEquals("New York", result.get(0)[2]);
	}

	@Test
	void testGetDataLines_MultiLine() {
		StringReader reader = CsvParserDataFactory.getSampleCsvReader();
		List<String[]> expectedData = CsvParserDataFactory.getExpectedParsedData();

		List<String[]> result = csvParser.getDataLines(reader);

		assertEquals(expectedData.size(), result.size());
		for (int i = 0; i < expectedData.size(); i++) {
			assertEquals(expectedData.get(i).length, result.get(i).length);
			for (int j = 0; j < expectedData.get(i).length; j++) {
				assertEquals(expectedData.get(i)[j], result.get(i)[j]);
			}
		}
	}

	@Test
	void testGetDataLines_EmbeddedQuotes() {
		String csvData = "Name;Age;City\n\"Jack, \"\"\";40;San Francisco";
		StringReader reader = new StringReader(csvData);

		List<String[]> result = csvParser.getDataLines(reader);

		assertEquals(1, result.size());
		assertEquals("Jack, ", result.get(0)[0]);
		assertEquals("40", result.get(0)[1]);
		assertEquals("San Francisco", result.get(0)[2]);
	}

	@Test
	void testGetDataLines_EmptyFile() {
		String csvData = "Name;Age;City\n";
		StringReader reader = new StringReader(csvData);

		List<String[]> result = csvParser.getDataLines(reader);

		assertEquals(0, result.size());
	}

	@Test
	void testProcessField() {
		CsvParserImpl parser = new CsvParserImpl();
		StringBuilder field = new StringBuilder("Example");
		boolean result = parser.processField(field);
		assert !result : "Expected embedded quotes flag to be false";
		assert field.toString().equals("Example\"") : "Expected field to end with a double quote";

		field = new StringBuilder();
		result = parser.processField(field);
		assert result : "Expected embedded quotes flag to be true for an empty field";
	}

	@Test
	void testJoinArrays() {
		CsvParserImpl parser = new CsvParserImpl();
		String[] array1 = {"A", "B", "C"};
		String[] array2 = {"D", "E", "F"};
		String[] result = parser.joinArrays(array1, array2);

		assert result.length == 6 : "Expected length of 6";
		assert result[0].equals("A") : "Expected 'A' at index 0";
		assert result[1].equals("B") : "Expected 'B' at index 1";
		assert result[2].equals("C") : "Expected 'C' at index 2";
		assert result[3].equals("D") : "Expected 'D' at index 3";
		assert result[4].equals("E") : "Expected 'E' at index 4";
		assert result[5].equals("F") : "Expected 'F' at index 5";
	}

}
