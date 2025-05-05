package lv.degra.accounting.core.system;

import java.util.List;

public interface DataFetcher<T> {
	List<T> getSuggestions(String searchText);
}
