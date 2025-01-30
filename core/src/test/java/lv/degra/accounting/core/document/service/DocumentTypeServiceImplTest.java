package lv.degra.accounting.core.document.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.Sort;

import lv.degra.accounting.core.document.model.DocumentType;
import lv.degra.accounting.core.document.model.DocumentTypeRepository;

class DocumentTypeServiceImplTest {

	@Mock
	private DocumentTypeRepository documentTypeRepository;

	@InjectMocks
	private DocumentTypeServiceImpl documentTypeService;

	@BeforeEach
	void setUp() {
		MockitoAnnotations.openMocks(this);
	}

	@Test
	void testGetDocumentTypeList() {
		// Arrange
		DocumentType docType1 = new DocumentType();
		docType1.setId(1);
		docType1.setName("Invoice");

		DocumentType docType2 = new DocumentType();
		docType2.setId(2);
		docType2.setName("Receipt");

		List<DocumentType> expectedList = Arrays.asList(docType1, docType2);

		when(documentTypeRepository.findAll(Sort.by(Sort.Direction.ASC, "id"))).thenReturn(expectedList);

		// Act
		List<DocumentType> result = documentTypeService.getDocumentTypeList();

		// Assert
		assertEquals(expectedList, result);
		verify(documentTypeRepository).findAll(Sort.by(Sort.Direction.ASC, "id"));
	}
}
