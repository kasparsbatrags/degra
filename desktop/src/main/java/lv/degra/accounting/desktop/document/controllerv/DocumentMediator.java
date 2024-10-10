package lv.degra.accounting.desktop.document.controllerv;

import static lv.degra.accounting.desktop.system.configuration.DegraDesktopConfig.APPLICATION_TITLE;
import static lv.degra.accounting.desktop.system.configuration.DegraDesktopConfig.DEFAULT_ERROR_MESSAGE;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import javafx.scene.control.Alert;
import lv.degra.accounting.core.document.bill.service.BillRowService;
import lv.degra.accounting.core.document.dto.DocumentDto;
import lv.degra.accounting.core.document.service.DocumentService;

@Component
public class DocumentMediator implements Mediator {

	private final InfoController infoController;
	private final MainController mainController;
	private final BillController billController;
	private final AdditionalInfoController additionalInfoController;
	private final DocumentService documentService;
	private final BillRowService billRowService;

	public DocumentMediator(@Lazy MainController mainController, @Lazy InfoController infoController, @Lazy BillController billController,
			@Lazy AdditionalInfoController additionalInfoController, DocumentService documentService, BillRowService billRowService) {
		this.additionalInfoController = additionalInfoController;
		this.documentService = documentService;
		this.billRowService = billRowService;
		this.billController = billController;
		this.infoController = infoController;
		this.mainController = mainController;
	}

	@Override
	public void updateDocumentTabs() {
		mainController.updateDocumentTabs();
	}

	@Override
	public DocumentDto getDocumentDto() {
		return mainController.getDocumentDto();
	}

	@Override
	public void setDocumentDto(DocumentDto documentDto) {
		mainController.setDocumentDto(documentDto);
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
	public void fillDocumentFormWithExistData(DocumentDto documentDto) {
		infoController.setDocumentData(documentDto);
		billController.setBillData(documentDto);
		additionalInfoController.setAdditionalInfoData(documentDto);
		infoController.refreshScreenControlsByDocumentSubType();
	}

	@Override
	public boolean validateDocument() {
		return infoController.validate();
	}

	public DocumentDto collectDocumentData() {
		DocumentDto documentDto = new DocumentDto();
		documentDto = infoController.getDocumentData(documentDto);
		documentDto = billController.getBillData(documentDto);
		documentDto = additionalInfoController.getAdditionalInfoData(documentDto);
		return documentDto;
	}

	public boolean saveDocument() {
		DocumentDto documentDto = collectDocumentData();
		boolean result = true;
		try {
			saveDocumentMainInfo(documentDto);
			if (isNewRecord(documentDto)) {
				mainController.getDocumentObservableList().add(documentDto);
			} else {
				if (!documentDto.isBill()) {
					billRowService.deleteBillRowByDocumentId(documentDto.getId());
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

	private boolean isNewRecord(DocumentDto documentDto) {
		return null == documentDto.getId();
	}

	protected void saveDocumentMainInfo(DocumentDto documentDto) {
		documentService.saveDocument(documentDto);
	}

}
