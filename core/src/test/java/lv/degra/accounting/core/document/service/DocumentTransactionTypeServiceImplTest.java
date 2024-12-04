package lv.degra.accounting.core.document.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.Sort;

import lv.degra.accounting.core.document.model.DocumentTransactionType;
import lv.degra.accounting.core.document.model.DocumentTransactionTypeRepository;

class DocumentTransactionTypeServiceImplTest {

	@Mock
	private DocumentTransactionTypeRepository documentTransactionTypeRepository;

	@InjectMocks
	private DocumentTransactionTypeServiceImpl documentTransactionTypeService;

	public DocumentTransactionTypeServiceImplTest() {
		MockitoAnnotations.openMocks(this);
	}

	@Test
	void testGetDocumentTransactionTypeList() {
		// Mock data
		DocumentTransactionType type1 = new DocumentTransactionType();
		type1.setId(1);
		type1.setName("Type1");

		DocumentTransactionType type2 = new DocumentTransactionType();
		type2.setId(2);
		type2.setName("Type2");

		List<DocumentTransactionType> mockList = Arrays.asList(type1, type2);

		// Define behavior
		when(documentTransactionTypeRepository.findAll(Sort.by(Sort.Direction.ASC, "id"))).thenReturn(mockList);

		// Call method
		List<DocumentTransactionType> result = documentTransactionTypeService.getDocumentTransactionTypeList();

		// Verify interactions
		verify(documentTransactionTypeRepository, times(1)).findAll(Sort.by(Sort.Direction.ASC, "id"));

		// Validate result
		assertNotNull(result, "Result should not be null");
		assertEquals(2, result.size(), "Result list size should be 2");
		assertEquals(type1, result.get(0), "First element should match");
		assertEquals(type2, result.get(1), "Second element should match");
	}
}
