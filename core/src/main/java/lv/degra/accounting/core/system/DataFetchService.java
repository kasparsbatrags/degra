package lv.degra.accounting.core.system;

import java.util.List;

public interface DataFetchService<T> {
	List<T> getSuggestions(String searchText);
}
