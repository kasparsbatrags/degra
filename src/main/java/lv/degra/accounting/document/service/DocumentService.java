package lv.degra.accounting.document.service;

import java.util.List;

import lv.degra.accounting.document.dto.DocumentDto;
import lv.degra.accounting.document.model.Document;

public interface DocumentService {

	DocumentDto getDocumentById(Integer id);

	DocumentDto saveDocument(DocumentDto documentDto);

	List<DocumentDto> getDocumentList();

	DocumentDto mapToDto(Document document);

	void deleteDocumentById(Integer documentId);
}
