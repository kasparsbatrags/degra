package lv.degra.accounting.core.document.service;

import static lv.degra.accounting.core.document.dataFactories.DocumentStatusDataFactory.createNewStatus;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.modelmapper.ModelMapper;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Sort;

import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ConstraintViolationException;
import lv.degra.accounting.core.document.dto.DocumentDto;
import lv.degra.accounting.core.document.model.Document;
import lv.degra.accounting.core.document.model.DocumentRepository;
import lv.degra.accounting.core.document.service.exception.SaveDocumentException;

class DocumentServiceImplTest {

	@Mock
	private DocumentRepository documentRepository;

	@Mock
	private DocumentStatusService documentStatusService;

	@Mock
	private ModelMapper modelMapper;

	@InjectMocks
	private DocumentServiceImpl documentService;

	@BeforeEach
	void setUp() {
		MockitoAnnotations.openMocks(this);
	}

	@Test
	void testGetDocumentById_Success() {
		Integer id = 1;
		Document document = new Document();
		document.setId(1);
		DocumentDto documentDto = new DocumentDto();

		when(documentRepository.getReferenceById(1L)).thenReturn(document);
		when(modelMapper.map(document, DocumentDto.class)).thenReturn(documentDto);

		DocumentDto result = documentService.getDocumentById(id);

		assertNotNull(result);
		verify(documentRepository).getReferenceById(1L);
		verify(modelMapper).map(document, DocumentDto.class);
	}

	@Test
	void testSaveDocument_NewDocument_Success() {
		DocumentDto documentDto = new DocumentDto();
		Document document = new Document();
		Document savedDocument = new Document();
		DocumentDto savedDto = new DocumentDto();

		when(modelMapper.map(documentDto, Document.class)).thenReturn(document);
		when(documentStatusService.getNewDocumentStatus()).thenReturn(createNewStatus());
		when(documentRepository.save(document)).thenReturn(savedDocument);
		when(modelMapper.map(savedDocument, DocumentDto.class)).thenReturn(savedDto);

		DocumentDto result = documentService.saveDocument(documentDto);

		assertNotNull(result);
		verify(modelMapper).map(documentDto, Document.class);
		verify(documentStatusService).getNewDocumentStatus();
		verify(documentRepository).save(document);
		verify(modelMapper).map(savedDocument, DocumentDto.class);
	}

	@Test
	void testSaveDocument_ExistingDocument_Success() {
		DocumentDto documentDto = new DocumentDto();
		documentDto.setId(1);
		Document document = new Document();
		Document savedDocument = new Document();
		DocumentDto savedDto = new DocumentDto();

		when(documentRepository.findById(1L)).thenReturn(Optional.of(document));
		when(documentRepository.save(document)).thenReturn(savedDocument);
		when(modelMapper.map(savedDocument, DocumentDto.class)).thenReturn(savedDto);

		DocumentDto result = documentService.saveDocument(documentDto);

		assertNotNull(result);
		verify(documentRepository).findById(1L);
		verify(modelMapper).map(documentDto, document);
		verify(documentRepository).save(document);
		verify(modelMapper).map(savedDocument, DocumentDto.class);
	}

	@Test
	void testSaveDocument_NullDto_ThrowsException() {
		IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
			documentService.saveDocument(null);
		});

		assertEquals("DocumentDto cannot be null", exception.getMessage());
	}

	@Test
	void testSaveDocument_ConstraintViolation_ThrowsException() {
		DocumentDto documentDto = new DocumentDto();
		DataIntegrityViolationException exception = new DataIntegrityViolationException("Constraint violation",
				new ConstraintViolationException(null));

		when(modelMapper.map(documentDto, Document.class)).thenThrow(exception);

		SaveDocumentException thrown = assertThrows(SaveDocumentException.class, () -> {
			documentService.saveDocument(documentDto);
		});

		assertTrue(thrown.getMessage().contains("Constraint violation"));
	}

	@Test
	void testSaveDocument_OtherViolation_ThrowsException() {
		DocumentDto documentDto = new DocumentDto();
		DataIntegrityViolationException exception = new DataIntegrityViolationException("General error");

		when(modelMapper.map(documentDto, Document.class)).thenThrow(exception);

		SaveDocumentException thrown = assertThrows(SaveDocumentException.class, () -> {
			documentService.saveDocument(documentDto);
		});

		assertTrue(thrown.getMessage().contains("Kļūda saglabājot dokumentu!"));
	}

	@Test
	void testGetDocumentList_Success() {
		List<Document> documents = new ArrayList<>();
		documents.add(new Document());
		List<DocumentDto> documentDtos = new ArrayList<>();
		documentDtos.add(new DocumentDto());

		when(documentRepository.findAll(Sort.by(Sort.Direction.ASC, "id"))).thenReturn(documents);
		when(modelMapper.map(documents.get(0), DocumentDto.class)).thenReturn(documentDtos.get(0));

		List<DocumentDto> result = documentService.getDocumentList();

		assertEquals(1, result.size());
		verify(documentRepository).findAll(Sort.by(Sort.Direction.ASC, "id"));
		verify(modelMapper).map(documents.get(0), DocumentDto.class);
	}

	@Test
	void testDeleteById_Success() {
		Integer id = 1;

		documentService.deleteById(id);

		verify(documentRepository).deleteById(1L);
	}

	@Test
	void testSaveDocument_EntityNotFoundException() {

		DocumentDto documentDto = new DocumentDto();
		documentDto.setId(100);


		when(documentRepository.findById(100L))
				.thenReturn(Optional.empty());

		EntityNotFoundException exception = assertThrows(EntityNotFoundException.class, () -> {
			documentService.saveDocument(documentDto);
		});

		assertTrue(exception.getMessage().contains("Document with ID 100 not found in the system."));
		verify(documentRepository).findById(100L);
		verifyNoMoreInteractions(documentRepository);
	}

}
