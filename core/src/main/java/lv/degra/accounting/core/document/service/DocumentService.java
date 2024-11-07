package lv.degra.accounting.core.document.service;

import java.util.List;

import lv.degra.accounting.core.document.dto.DocumentDto;


public interface DocumentService {

    DocumentDto getDocumentById(Integer id);

    DocumentDto saveDocument(DocumentDto documentDto);

    List<DocumentDto> getDocumentList();

    void deleteById(Integer documentId);
}
