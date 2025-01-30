package lv.degra.accounting.core.document.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.Sort;

import lv.degra.accounting.core.document.model.DocumentSubType;
import lv.degra.accounting.core.document.model.DocumentSubTypeRepository;

class DocumentSubTypeServiceImplTest {

	private DocumentSubTypeServiceImpl documentSubTypeService;

	@Mock
	private DocumentSubTypeRepository documentSubTypeRepository;

	@BeforeEach
	void setUp() {
		MockitoAnnotations.openMocks(this);
		documentSubTypeService = new DocumentSubTypeServiceImpl(documentSubTypeRepository);
	}

	@Test
	void testGetDocumentSubTypeList() {
		// Arrange
		DocumentSubType subType1 = new DocumentSubType();
		subType1.setId(1);

		DocumentSubType subType2 = new DocumentSubType();
		subType2.setId(2);

		when(documentSubTypeRepository.findAll(Sort.by(Sort.Direction.ASC, "id")))
				.thenReturn(Arrays.asList(subType1, subType2));

		// Act
		List<DocumentSubType> result = documentSubTypeService.getDocumentSubTypeList();

		// Assert
		assertNotNull(result);
		assertEquals(2, result.size());
		assertEquals(1, result.get(0).getId());
		assertEquals(2, result.get(1).getId());
		verify(documentSubTypeRepository, times(1)).findAll(Sort.by(Sort.Direction.ASC, "id"));
	}
}
