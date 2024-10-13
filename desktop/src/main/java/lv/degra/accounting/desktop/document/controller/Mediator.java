package lv.degra.accounting.desktop.document.controller;

import lv.degra.accounting.core.document.dto.DocumentDto;

public interface Mediator {

	void updateDocumentTabs();

	DocumentDto getDocumentDto();

	void setDocumentDto(DocumentDto documentDto);

	void disableDocumentButtons();

	void enableDocumentButtons();

	void setDocumentInfoSumTotalFieldValue(Double documentTotalSum);

	void fillDocumentFormWithExistData(DocumentDto documentDto);

	boolean validateDocument();

	DocumentDto collectDocumentData();

	boolean saveDocument();
}
