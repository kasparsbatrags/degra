package lv.degra.accounting.company;

import java.io.Reader;
import java.util.List;

public interface CsvParser {
	List<String[]> getDataLines(Reader file);
}
