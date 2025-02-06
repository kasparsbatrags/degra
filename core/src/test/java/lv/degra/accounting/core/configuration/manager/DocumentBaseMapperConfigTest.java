package lv.degra.accounting.core.configuration.manager;

import static lv.degra.accounting.core.account.posted.AccountPostedDtoDataFactory.createValidAccountPostedDto;
import static lv.degra.accounting.core.document.dataFactories.DocumentDataFactory.createValidDocument;
import static lv.degra.accounting.core.document.dto.DocumentDtoDataFactory.createValidDocumentDto;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.modelmapper.ModelMapper;

import lv.degra.accounting.core.account.posted.dto.AccountPostedDto;
import lv.degra.accounting.core.account.posted.model.AccountPosted;
import lv.degra.accounting.core.config.mapper.DocumentBaseMapperConfig;
import lv.degra.accounting.core.document.dto.DocumentDto;
import lv.degra.accounting.core.document.model.Document;

public class DocumentBaseMapperConfigTest {

	private ModelMapper modelMapper;

	@BeforeEach
	public void setUp() {
		DocumentBaseMapperConfig documentBaseMapperConfig = new DocumentBaseMapperConfig();
		this.modelMapper = documentBaseMapperConfig.modelMapper();
	}

	@Test
	public void testDocumentDtoToDocumentMapping() {
		// Given
		DocumentDto documentDto = new DocumentDto();
		AccountPostedDto accountPostedDto = new AccountPostedDto();
		documentDto.setAccountPostedList(List.of(accountPostedDto));

		// When
		Document document = modelMapper.map(documentDto, Document.class);

		// Then
		assertNotNull(document);
		assertNotNull(document.getAccountPostedList());
		assertEquals(1, document.getAccountPostedList().size());
		assertEquals(document, document.getAccountPostedList().get(0).getDocument());
	}

	@Test
	public void testDocumentToDocumentDtoMapping() {
		// Given
		Document document = new Document();
		AccountPosted accountPosted = new AccountPosted();
		document.setAccountPostedList(List.of(accountPosted));

		// When
		DocumentDto documentDto = modelMapper.map(document, DocumentDto.class);

		// Then
		assertNotNull(documentDto);
		assertNotNull(documentDto.getAccountPostedList());
		assertEquals(1, documentDto.getAccountPostedList().size());
		assertEquals(documentDto, documentDto.getAccountPostedList().get(0).getDocumentDto());
	}

	@Test
	public void testNullValuesAreNotMapped() {
		// Given
		DocumentDto documentDto = new DocumentDto();
		documentDto.setAccountPostedList(null);

		// When
		Document document = modelMapper.map(documentDto, Document.class);

		// Then
		assertNotNull(document);
		assertNull(document.getAccountPostedList());
	}

	@Test
	public void testEmptyAccountPostedListMapping() {
		// Given
		DocumentDto documentDto = new DocumentDto();
		documentDto.setAccountPostedList(Collections.emptyList());

		// When
		Document document = modelMapper.map(documentDto, Document.class);

		// Then
		assertNotNull(document);
		assertNotNull(document.getAccountPostedList());
		assertTrue(document.getAccountPostedList().isEmpty());
	}

	@Test
	public void testAccountPostedListClearingAndAddingNewElements() {
		// Given
		DocumentDto documentDto = createValidDocumentDto();
		AccountPostedDto accountPostedDto1 = createValidAccountPostedDto();
		AccountPostedDto accountPostedDto2 = createValidAccountPostedDto();
		documentDto.setAccountPostedList(List.of(accountPostedDto1, accountPostedDto2));

		Document existingDocument = createValidDocument();
		existingDocument.setAccountPostedList(List.of(new AccountPosted()));

		// When
		modelMapper.map(documentDto, existingDocument);

		// Then
		assertNotNull(existingDocument.getAccountPostedList());
		assertEquals(2, existingDocument.getAccountPostedList().size());
	}
}
