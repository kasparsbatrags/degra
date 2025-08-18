package lv.degra.accounting.core;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Generic paged response DTO for API endpoints.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PagedResponse<T> {
	private List<T> items;
	private int page;
	private int size;
	private long totalCount;
}
