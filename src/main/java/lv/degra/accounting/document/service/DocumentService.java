package lv.degra.accounting.document.service;

import java.util.List;

import lv.degra.accounting.document.dto.DocumentDto;
import lv.degra.accounting.document.model.Document;

public interface DocumentService {
	Document saveDocument(DocumentDto documentDto);

	List<Document> getDocumentList();

	DocumentDto mapToDto(Document document);

	void deleteDocumentById(Integer documentId);
}
