package lv.degra.accounting.document.service;

import lv.degra.accounting.document.Dto.DocumentDto;

public interface DocumentService {
    void createDocument(DocumentDto documentDto);
}
