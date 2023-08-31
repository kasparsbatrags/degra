package lv.degra.accounting.document.service;

import lv.degra.accounting.document.dto.DocumentDto;

public interface DocumentService {
    void createDocument(DocumentDto documentDto);
}
