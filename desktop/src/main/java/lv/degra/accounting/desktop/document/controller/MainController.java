package lv.degra.accounting.desktop.document.controller;

import static lv.degra.accounting.desktop.system.configuration.DegraDesktopConfig.APPLICATION_TITLE;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javafx.collections.ObservableList;
import javafx.fxml.FXML;
import javafx.scene.control.Alert;
import javafx.scene.control.Button;
import javafx.scene.control.ButtonType;
import javafx.scene.control.Tab;
import javafx.scene.control.TabPane;
import lombok.Getter;
import lombok.Setter;
import lv.degra.accounting.core.document.dto.DocumentDto;
import lv.degra.accounting.core.document.service.DocumentService;
import lv.degra.accounting.desktop.system.component.ControlWithErrorLabel;
import lv.degra.accounting.desktop.system.utils.DegraController;
import lv.degra.accounting.desktop.validation.service.ValidationService;

@Component
public class MainController extends DegraController {

	private final Mediator mediator;
	private final InfoController infoController;
	private final AdditionalInfoController additionalInfoController;
	private final BillController billController;
	private final DocumentDto documentDto = null;
	private final ValidationService validationService;
	private final DocumentService documentService;
	@FXML
	public TabPane documentTabPane;
	@FXML
	public Tab documentInfoTab;
	@FXML
	public Button saveButton;
	@Getter
	private DocumentDto documentDtoOld = null;
	@Setter
	@Getter
	private ObservableList<DocumentDto> documentObservableList;
	@FXML
	private Tab billContentTab;

	@Autowired
	public MainController(Mediator mediator,
			InfoController infoController,
			AdditionalInfoController additionalInfoController,
			BillController billController, ValidationService validationService, DocumentService documentService) {
		this.mediator = mediator;
		this.infoController = infoController;
		this.additionalInfoController = additionalInfoController;
		this.billController = billController;
		this.validationService = validationService;
		this.documentService = documentService;
	}

	@FXML
	private void initialize() {
		mediator.setMainController(this);
		mediator.setInfoController(infoController);
		mediator.setAdditionalInfoController(additionalInfoController);
		mediator.setBillController(billController);
		mediator.setValidationService(validationService);
		mediator.setDocumentService(documentService);
		mediator.updateDocumentTabs();
	}

	@FXML
	public void onSaveDocumentButton() {
		if (validateDocumentInfo() && mediator.saveDocument()) {
			closeWindows();
		}
	}


	@FXML
	public void billContentOpenAction() {

		if (infoController.isDocumentInfoChanged()) {
			Alert alert = new Alert(Alert.AlertType.ERROR, "Dokumenta pamatinformācija nav saglabāta! Saglabāju tagad!", ButtonType.OK);
			alert.setTitle(APPLICATION_TITLE);
			alert.showAndWait();
			if (validateDocumentInfo()) {
				//				saveDocumentMainInfo();
			} else {
				switchToDocumentInfoTab();
			}
		}

		billController.setBillContentOpenAction();
	}

	protected boolean validateDocumentInfo() {
		List<ControlWithErrorLabel<?>> validationControls = mediator.getValidationControls();
		boolean allValid = true;

		for (ControlWithErrorLabel<?> control : validationControls) {
			control.validate();
			if (!control.isValid()) {
				allValid = false;
			}
		}

		if (!allValid) {
			Alert alert = new Alert(Alert.AlertType.ERROR, "Lūdzu, aizpildiet visus nepieciešamos laukus.", ButtonType.OK);
			alert.setTitle(APPLICATION_TITLE);
			alert.showAndWait();
		}

		return allValid;
	}

	public DocumentDto getDocumentDto() {
		return Optional.ofNullable(infoController).map(InfoController::fillDocumentDto).orElse(null);
	}

	//	public void enableDocumentButtons() {
	//		changeDocumentButtonStatus(false);
	//	}

	public void switchToDocumentInfoTab() {
		documentTabPane.getSelectionModel().select(documentInfoTab);
	}

	public void setDocument(DocumentDto documentDto) {
		mediator.setDocument(documentDto);
		//		this.documentDto = documentDto;
		//		if (documentDto != null) {
		//			infoController.fillDocumentFormWithExistData(documentDto);
		//		}
		//		actualizeDocumentTabs();
		//		infoController.refreshScreenControls();
	}

	public void showBillTab() {
		if (!documentTabPane.getTabs().contains(billContentTab)) {
			documentTabPane.getTabs().add(billContentTab);
		}
	}

	public void hideBillTab() {
		documentTabPane.getTabs().remove(billContentTab);
	}

	public void setDocumentList(ObservableList<DocumentDto> documentList) {
		this.documentObservableList = documentList;
	}

	protected void changeDocumentButtonStatus(boolean setDisable) {
		saveButton.setDisable(setDisable);
		closeButton.setDisable(setDisable);
	}

	//	public void disableDocumentButtons() {
	//		changeDocumentButtonStatus(true);
	//	}

	public void onPrintDocumentButton() {
		//		List<BillContentDto> billPositionData = billController.billRowService.getByDocumentId(documentDto.getId());
		//		JasperPrint jasperPrint = reportService.getReportWithData(billPositionData, documentDto, false);
		//		JasperViewer viewer = new JasperViewer(jasperPrint, false);
		//		viewer.setVisible(true);
		//
	}

	public void setDocumentAdditionalInfoSumTotalFieldValue(String text) {
		additionalInfoController.notesForCustomerField.setText(String.valueOf(text));
	}

	public void setDocumentAdditionalInternalNotesFieldValue(String text) {
		additionalInfoController.internalNotesField.setText(String.valueOf(text));
	}

	public String getDocumentAdditionalInfoControllerNotesForCustomer() {
		return additionalInfoController.notesForCustomerField.getText();
	}

	public String getDocumentAdditionalInfoInternalNotes() {
		return additionalInfoController.internalNotesField.getText();
	}

	public void setDocumentInfoSumTotalFieldValue(Double value) {
		infoController.sumTotalField.setText(String.valueOf(value));
		infoController.sumTotalOnAction();
	}

	public void setDocumentDtoOld() {
		this.documentDtoOld = this.documentDto;
	}

	public void enableDocumentButtons() {
		saveButton.setDisable(false);
		closeButton.setDisable(false);
	}

	public void disableDocumentButtons() {
		saveButton.setDisable(true);
		closeButton.setDisable(true);
	}

}
