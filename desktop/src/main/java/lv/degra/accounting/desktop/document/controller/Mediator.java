package lv.degra.accounting.desktop.document.controller;

import lv.degra.accounting.core.account.posted.dto.AccountPostedDto;
import lv.degra.accounting.core.document.dto.DocumentDto;
import lv.degra.accounting.desktop.system.component.lazycombo.ControlWithErrorLabel;
import lv.degra.accounting.desktop.system.component.tableView.DynamicTableView;

public interface Mediator {

	void updateDocumentTabs();

	DocumentDto getEditableDocumentDto();

	void setDocumentDto(DocumentDto documentDto);

	void disableDocumentButtons();

	void enableDocumentButtons();

	void setDocumentInfoSumTotalFieldValue(Double documentTotalSum);

	void setData();

	boolean idDocumentValid();

	boolean saveDocument();

	ControlWithErrorLabel<String> getSumTotalField();

	DynamicTableView<AccountPostedDto> getAccountPostedListView();

	void storeDataFromControlsToDto();

}
