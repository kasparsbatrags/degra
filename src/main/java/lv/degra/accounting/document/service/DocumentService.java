package lv.degra.accounting.document.service;

import java.util.List;

import lv.degra.accounting.document.dto.DocumentDto;

public interface DocumentService {

	DocumentDto getDocumentById(Integer id);

	DocumentDto saveDocument(DocumentDto documentDto);

	List<DocumentDto> getDocumentList();

	void deleteDocumentById(Integer documentId);
}
