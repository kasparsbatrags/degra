package lv.degra.accounting.document.service;

import lv.degra.accounting.document.dto.DocumentDto;
import lv.degra.accounting.document.model.Document;

import java.util.List;

public interface DocumentService {
    Document saveDocument(DocumentDto documentDto);

    List<Document> getDocumentList();

    DocumentDto mapToDto(Document document);
    void deleteDocumentById(Integer documentId);
}
