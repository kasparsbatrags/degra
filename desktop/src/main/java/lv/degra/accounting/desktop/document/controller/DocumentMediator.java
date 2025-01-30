package lv.degra.accounting.desktop.document.controller;

import static lv.degra.accounting.desktop.system.configuration.DegraDesktopConfig.APPLICATION_TITLE;
import static lv.degra.accounting.desktop.system.configuration.DegraDesktopConfig.DEFAULT_ERROR_MESSAGE;
import static lv.degra.accounting.desktop.system.configuration.DegraDesktopConfig.POSTING_WRONG_SUM_ERROR_TEXT;

import java.math.BigDecimal;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import javafx.scene.control.Alert;
import lombok.Getter;
import lombok.Setter;
import lv.degra.accounting.core.account.posted.dto.AccountPostedDto;
import lv.degra.accounting.core.document.dto.DocumentDto;
import lv.degra.accounting.core.document.service.DocumentService;
import lv.degra.accounting.desktop.system.component.lazycombo.ControlWithErrorLabel;
import lv.degra.accounting.desktop.system.component.tableView.DynamicTableView;

@Setter
@Getter
@Component
public class DocumentMediator implements Mediator {

	private final InfoController infoController;
	private final MainController mainController;
	private final BillController billController;
	private final AdditionalInfoController additionalInfoController;
	private final DocumentService documentService;

	private DocumentDto originalDocument;
	private DocumentDto editableDocument;

	public DocumentMediator(@Lazy MainController mainController, @Lazy InfoController infoController, @Lazy BillController billController,
			@Lazy AdditionalInfoController additionalInfoController, DocumentService documentService) {
		this.additionalInfoController = additionalInfoController;
		this.documentService = documentService;
		this.billController = billController;
		this.infoController = infoController;
		this.mainController = mainController;
	}

	@Override
	public void updateDocumentTabs() {
		mainController.updateDocumentTabs();
	}

	@Override
	public DocumentDto getEditableDocumentDto() {
		return editableDocument;
	}

	public void setDocumentDto(DocumentDto documentDto) {
		editableDocument = documentDto;
	}

	@Override
	public void disableDocumentButtons() {
		mainController.disableDocumentButtons();
	}

	@Override
	public void enableDocumentButtons() {
		mainController.enableDocumentButtons();
	}

	@Override
	public void setDocumentInfoSumTotalFieldValue(Double documentTotalSum) {
		infoController.sumTotalField.setText(String.valueOf(documentTotalSum));
		infoController.sumTotalOnAction();
	}

	@Override
	public ControlWithErrorLabel<String> getSumTotalField() {
		return infoController.getSumTotalField();
	}

	@Override
	public DynamicTableView<AccountPostedDto> getAccountPostedListView() {
		return additionalInfoController.getPostingListView();
	}

	@Override
	public boolean idDocumentValid() {
		storeDataFromControlsToDto();
		boolean postingListIsValid = additionalInfoController.validateAccountPostsList();
		if (!postingListIsValid) {
			BigDecimal postingAmountTotal = additionalInfoController.getPostingListView().getColumnSum("amount");
			infoController.addValidationControl(infoController.getSumTotalField(),
					value -> new BigDecimal(value).compareTo(postingAmountTotal) == 0, POSTING_WRONG_SUM_ERROR_TEXT);
		} else {
			infoController.removeValidationControlByMessage(infoController.getSumTotalField(), POSTING_WRONG_SUM_ERROR_TEXT);
		}
		return infoController.validate() && additionalInfoController.validate() && postingListIsValid;
	}

	public void setData() {
		mainController.setData(this.editableDocument);
		infoController.setData(this.editableDocument);
		billController.setData(this.editableDocument);
		additionalInfoController.setData(this.editableDocument);

		infoController.refreshScreenControlsByDocumentSubType();

		infoController.setControllerObjectsValidationRulesByDocumentSubtype(infoController.getDocumentSubTypeId());
		additionalInfoController.setControllerObjectsValidationRulesByDocumentSubtype(infoController.getDocumentSubTypeId());
	}

	public void storeDataFromControlsToDto() {
		mainController.getData(this.editableDocument);
		infoController.getData(this.editableDocument);
		billController.getData(this.editableDocument);
		additionalInfoController.getData(this.editableDocument);
	}

	public void startEditing(DocumentDto document) {
		this.originalDocument = document;
		this.editableDocument = new DocumentDto(document);
	}

	public void stopEditing() {
		originalDocument.update(editableDocument);
	}

	public boolean saveDocument() {
		boolean result = true;
		try {
			stopEditing();
			documentService.saveDocument(originalDocument);
			if (isNewRecord(originalDocument)) {
				mainController.getDocumentObservableList().add(originalDocument);
			}
		} catch (Exception e) {
			mainController.switchToDocumentInfoTab();
			Alert alert = new Alert(Alert.AlertType.NONE);
			alert.setTitle(APPLICATION_TITLE);
			alert.setAlertType(Alert.AlertType.ERROR);
			alert.setContentText(DEFAULT_ERROR_MESSAGE + e.getMessage());
			alert.show();
			result = false;
		}
		return result;
	}

	private boolean isNewRecord(DocumentDto documentDto) {
		return null == documentDto.getId();
	}

//	public Integer getSelectedDocumentSubType() {
//		DocumentSubType documentSubType = infoController.documentSubTypeCombo.getValue();
//		return documentSubType != null ? documentSubType.getId() : null;
//	}

}
