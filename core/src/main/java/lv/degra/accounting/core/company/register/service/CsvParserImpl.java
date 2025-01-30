package lv.degra.accounting.core.company.register.service;

import java.io.BufferedReader;
import java.io.Reader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Stream;

import org.springframework.stereotype.Service;

@Service
public class CsvParserImpl implements CsvParser {
	protected static final char DOUBLE_QUOTES = '"';
	private static final char DEFAULT_QUOTE_CHAR = DOUBLE_QUOTES;
	private static final char DEFAULT_SEPARATOR = ';';
	private static final String NEW_LINE = "\n";

	private boolean isMultiLine = false;
	private String[] pendingFieldLine = new String[]{};
	private String pendingField = "";

	public List<String[]> getDataLines(Reader file){

		List<String[]> lineData =  new ArrayList<>();

		new BufferedReader(file).lines().skip(1).forEach(s -> {

			String[] currentLine=processLine(s);

			if (isMultiLine) {
				pendingFieldLine = joinArrays(pendingFieldLine, currentLine);
			} else {
				if (pendingFieldLine != null && pendingFieldLine.length > 0) {
					lineData.add(joinArrays(pendingFieldLine, currentLine));
					pendingFieldLine = new String[]{};
				} else {
					lineData.add(currentLine);
				}
			}
		});

		return lineData;
	}

	protected String[] processLine(String line) {
		return parseLine(line).toArray(new String[0]);
	}

	protected String[] joinArrays(String[] array1, String[] array2) {
		return Stream.concat(Arrays.stream(array1), Arrays.stream(array2))
				.toArray(String[]::new);
	}


	private List<String> parseLine(String line) {

		List<String> result = new ArrayList<>();
		boolean inQuotes = false;
		boolean isFieldWithEmbeddedDoubleQuotes = false;

		StringBuilder currentField = new StringBuilder();

		for (char currentChar : line.toCharArray()) {

			isFieldWithEmbeddedDoubleQuotes = processQuotes(currentChar, isFieldWithEmbeddedDoubleQuotes, currentField);

			if (isMultiLine) {
				currentField.append(pendingField).append(NEW_LINE);
				pendingField = "";
				inQuotes = true;
				isMultiLine = false;
			}

			if (currentChar == DEFAULT_QUOTE_CHAR) {
				inQuotes = !inQuotes;
			} else {
				if (currentChar == DEFAULT_SEPARATOR && !inQuotes) {
					result.add(currentField.toString());
					currentField.setLength(0);
				} else {
					currentField.append(currentChar);
				}
			}
		}
		if (inQuotes) {
			pendingField= currentField.toString();
			isMultiLine = true;
		} else {
			result.add(currentField.toString());
		}
		return result;
	}


	protected boolean processQuotes(char currentChars, boolean isFieldWithEmbeddedDoubleQuotes, StringBuilder currentField) {

		if (currentChars == DOUBLE_QUOTES && isFieldWithEmbeddedDoubleQuotes) {
			isFieldWithEmbeddedDoubleQuotes = processField(currentField);
		} else {
			isFieldWithEmbeddedDoubleQuotes = false;
		}

		return isFieldWithEmbeddedDoubleQuotes;

	}

	protected boolean processField(StringBuilder field) {

		boolean isFieldWithEmbeddedDoubleQuotes = true;

		if (!field.isEmpty()) {
			field.append(DOUBLE_QUOTES);
			isFieldWithEmbeddedDoubleQuotes = false;
		}
		return isFieldWithEmbeddedDoubleQuotes;
	}

}
