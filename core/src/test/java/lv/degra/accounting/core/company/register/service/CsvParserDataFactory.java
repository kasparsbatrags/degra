package lv.degra.accounting.core.company.register.service;

import java.io.StringReader;
import java.util.List;

public class CsvParserDataFactory {

	public static String getSampleCsvData() {
		return "Name;Age;City\n" + "John Doe;30;New York\n" + "Jane Smith;25;Los Angeles\n" + "\"Jack,\";40;San Francisco";
	}

	public static StringReader getSampleCsvReader() {
		return new StringReader(getSampleCsvData());
	}

	public static List<String[]> getExpectedParsedData() {
		return List.of(new String[] { "John Doe", "30", "New York" }, new String[] { "Jane Smith", "25", "Los Angeles" },
				new String[] { "Jack,", "40", "San Francisco" });
	}
}
