package lv.degra.accounting.core.document.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import lv.degra.accounting.core.document.model.DocumentStatus;
import lv.degra.accounting.core.document.model.DocumentStatusRepository;

class DocumentStatusServiceImplTest {

	@Mock
	private DocumentStatusRepository documentStatusRepository;

	@InjectMocks
	private DocumentStatusServiceImpl documentStatusService;

	@BeforeEach
	void setUp() {
		MockitoAnnotations.openMocks(this);
	}

	@Test
	void testGetNewDocumentStatus() {
		// Arrange
		DocumentStatus mockStatus = new DocumentStatus();
		mockStatus.setCode("J");
		when(documentStatusRepository.findByCode("J")).thenReturn(mockStatus);

		// Act
		DocumentStatus result = documentStatusService.getNewDocumentStatus();

		// Assert
		assertEquals("J", result.getCode());
		verify(documentStatusRepository, times(1)).findByCode("J");
	}
}
