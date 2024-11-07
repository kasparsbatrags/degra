package lv.degra.accounting.desktop.document.controller;

import lv.degra.accounting.core.document.dto.DocumentDto;

public interface Mediator {

	void updateDocumentTabs();

	DocumentDto getEditableDocumentDto();

	void setDocumentDto(DocumentDto documentDto);

	void disableDocumentButtons();

	void enableDocumentButtons();

	void setDocumentInfoSumTotalFieldValue(Double documentTotalSum);

	void setData();

	boolean validateDocument();

	boolean saveDocument();
}
