package lv.degra.accounting.core.company.register.service;

import java.io.Reader;
import java.util.List;

public interface CsvParser {
	List<String[]> getDataLines(Reader file);
}
