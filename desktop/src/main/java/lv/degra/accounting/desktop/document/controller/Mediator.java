package lv.degra.accounting.desktop.document.controller;

import static lv.degra.accounting.desktop.system.configuration.DegraDesktopConfig.APPLICATION_TITLE;
import static lv.degra.accounting.desktop.system.configuration.DegraDesktopConfig.DEFAULT_ERROR_MESSAGE;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Predicate;

import org.springframework.stereotype.Component;

import javafx.scene.control.Alert;
import lombok.Getter;
import lombok.Setter;
import lv.degra.accounting.core.document.dto.DocumentDto;
import lv.degra.accounting.core.document.service.DocumentService;
import lv.degra.accounting.desktop.system.component.ControlWithErrorLabel;
import lv.degra.accounting.desktop.validation.service.ValidationService;

@Component
@Setter
public class Mediator {
	@Getter
	protected List<ControlWithErrorLabel<?>> validationControls = new ArrayList<>();
	@Getter
	private DocumentDto documentDto;
	private InfoController infoController;
	private BillController billController;
	private MainController mainController;
	private AdditionalInfoController additionalInfoController;
	private ValidationService validationService;
	private DocumentService documentService;

	public void clearValidationControls() {
		validationControls.clear();
	}

	public <T> void addValidationControl(ControlWithErrorLabel<T> control, Predicate<T> validationCondition, String errorMessage) {
		control.setValidationCondition(validationCondition, errorMessage);
		validationControls.add(control);
	}

	public void setDocument(DocumentDto documentDto) {
		this.documentDto = documentDto;
		if (documentDto != null) {
			infoController.fillDocumentFormWithExistData(documentDto);
			additionalInfoController.fillDocumentFormWithExistData(documentDto);
		}
		// Atjaunina MainController tabulas un citas sadaļas
		//		mainController.actualizeDocumentTabs();
		// Atjaunina ekrāna kontroles InfoController
		infoController.refreshScreenControls();
	}

	//	public void documentTypeChanged(DocumentSubType newType) {
	//		billController.updateVisibility(newType);
	//		additionalInfoController.updateFields(newType);
	//	}

	//	public void billTotalChanged(double newTotal) {
	//		infoController.updateTotalSum(newTotal);
	//	}

	public Object getControllerFieldByName(String name) {
		Object field = validationService.getFieldByName(infoController, name, InfoController.class);
		if (field == null) {
			field = validationService.getFieldByName(additionalInfoController, name, AdditionalInfoController.class);
		}
		if (field == null) {
			field = validationService.getFieldByName(billController, name, BillController.class);
		}

		return field;

	}

	public boolean saveDocument() {
		documentDto = collectDocumentData();
		boolean result = true;
		try {
			boolean isItNewRecord = isNewRecord();
			saveDocumentMainInfo();
			if (isItNewRecord) {
				addToDocumentObservableList(documentDto);
			} else {
				if (!documentDto.isBill()) {
					billController.billRowService.deleteBillRowByDocumentId(documentDto.getId());
				}
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

	private void addToDocumentObservableList(DocumentDto documentDto) {
		mainController.getDocumentObservableList().add(documentDto);
	}

	protected void saveDocumentMainInfo() {
		documentService.saveDocument(documentDto);
	}

	private boolean isNewRecord() {
		return this.documentDto != null && this.documentDto.getId() == null;
	}

	public DocumentDto collectDocumentData() {
		DocumentDto documentDto = new DocumentDto();

		documentDto = infoController.getDocumentData(documentDto);
		documentDto = billController.getBillData(documentDto);
		documentDto = additionalInfoController.getAdditionalInfoData(documentDto);

		return documentDto;
	}

	public void updateDocumentTabs() {
		if (documentDto != null && documentDto.isBill()) {
			mainController.showBillTab();
		} else {
			mainController.hideBillTab();
		}
	}
}