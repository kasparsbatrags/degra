package lv.degra.accounting.document.service;

import javafx.collections.ObservableList;
import lv.degra.accounting.document.dto.DocumentDto;
import lv.degra.accounting.document.model.Document;

public interface DocumentService {
    void createDocument(DocumentDto documentDto);
    ObservableList<Document> getDocumentList();
}
