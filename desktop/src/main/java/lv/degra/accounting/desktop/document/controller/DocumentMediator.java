package lv.degra.accounting.desktop.document.controller;

import static lv.degra.accounting.desktop.system.configuration.DegraDesktopConfig.APPLICATION_TITLE;
import static lv.degra.accounting.desktop.system.configuration.DegraDesktopConfig.DEFAULT_ERROR_MESSAGE;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import javafx.scene.control.Alert;
import lombok.Getter;
import lombok.Setter;
import lv.degra.accounting.core.document.dto.DocumentDto;
import lv.degra.accounting.core.document.service.DocumentService;

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

	public void setData() {
		mainController.setData(this.editableDocument);
		infoController.setData(this.editableDocument);
		billController.setData(this.editableDocument);
		additionalInfoController.setData(this.editableDocument);
		infoController.refreshScreenControlsByDocumentSubType();
	}

	public void getData() {
		mainController.getData(this.editableDocument);
		infoController.getData(this.editableDocument);
		billController.getData(this.editableDocument);
		additionalInfoController.getData(this.editableDocument);
	}


	@Override
	public boolean validateDocument() {
		return infoController.validate();
	}

	public void startEditing(DocumentDto document) {
		this.originalDocument = document;
		this.editableDocument = new DocumentDto(document);
	}

	public void saveChanges() {
		getData();
		originalDocument.update(editableDocument);
	}

	public void discardChanges() {
		editableDocument = new DocumentDto(originalDocument);
	}

	public boolean saveDocument() {
		boolean result = true;
		try {
			saveChanges();
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

}
