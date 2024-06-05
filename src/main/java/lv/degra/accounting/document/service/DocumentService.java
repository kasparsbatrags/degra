package lv.degra.accounting.document.service;

import lv.degra.accounting.document.dto.DocumentDto;

import java.util.List;


public interface DocumentService {

    DocumentDto getDocumentById(Integer id);

    DocumentDto saveDocument(DocumentDto documentDto);

    List<DocumentDto> getDocumentList();

    void deleteDocumentById(Integer documentId);
}
