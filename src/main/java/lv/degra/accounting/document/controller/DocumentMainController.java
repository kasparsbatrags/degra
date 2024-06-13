package lv.degra.accounting.document.controller;

import static lv.degra.accounting.system.configuration.DegraConfig.APPLICATION_TITLE;
import static lv.degra.accounting.system.configuration.DegraConfig.DEFAULT_ERROR_MESSAGE;

import java.util.ArrayList;
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
import lv.degra.accounting.document.dto.BillContentDto;
import lv.degra.accounting.document.dto.DocumentDto;
import lv.degra.accounting.document.service.DocumentService;
import lv.degra.accounting.report.service.ReportService;
import lv.degra.accounting.system.object.ControlWithErrorLabel;
import lv.degra.accounting.system.object.DataValueChangeListener;
import lv.degra.accounting.system.utils.DegraController;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.view.JasperViewer;

@Component
public class DocumentMainController extends DegraController {

	private static final List<DataValueChangeListener> dataValueChangesList = new ArrayList<>();
	private final DocumentInfoController documentInfoController;
	private final BillController billController;
	private final DocumentService documentService;
	private final ReportService reportService;
	@FXML
	public TabPane documentTabPane;
	@FXML
	public Tab documentInfoTab;
	@FXML
	public Button saveButton;
	private DocumentDto documentDto = null;
	private ObservableList<DocumentDto> documentObservableList;
	@FXML
	private Tab billContentTab;

	@Autowired
	public DocumentMainController(DocumentInfoController documentInfoController, BillController billController,
			DocumentService documentService, ReportService reportService) {
		this.documentInfoController = documentInfoController;
		this.billController = billController;
		this.documentService = documentService;
		this.reportService = reportService;
	}

	public static void addToDataValueChangesList(DataValueChangeListener dataSavable) {
		dataValueChangesList.add(dataSavable);
	}

	@FXML
	private void initialize() {
		documentInfoController.injectMainController(this);
		billController.injectMainController(this);
		actualizeDocumentTabs();
	}

	@FXML
	public void onSaveDocumentButton() {
		if (validateDocumentInfo() && saveDocument()) {
			closeWindows();
		}

	}

	@FXML
	public void billContentOpenAction() {

		//		if (infoChanged) {
		//			Alert alert = new Alert(Alert.AlertType.ERROR, "Dokumenta pamatinformācija nav saglabāta! Saglabāju tagad!", ButtonType.OK);
		//			alert.setTitle(APPLICATION_TITLE);
		//			alert.showAndWait();
		//			saveDocumentMainInfo();
		//			billController.setBillContentOpenAction();
		//		} else {
		billController.setBillContentOpenAction();
		//		}
	}

	public void actualizeDocumentTabs() {
		if (documentInfoController.isDocumentBill()) {
			showBillTab();
		} else {
			hideBillTab();
		}
	}

	private boolean validateDocumentInfo() {
		List<ControlWithErrorLabel<?>> validationControls = documentInfoController.getValidationControls();
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

	//	private boolean isDocumentInfoChanged() {
	//		return dataValueChangesList.stream()
	//				.filter(object -> object.isValueChanged())
	//				.findFirst()
	//				.isPresent();
	//	}

	protected void saveDocumentMainInfo() {
		documentService.saveDocument(documentDto);
	}

	public boolean saveDocument() {
		boolean result = true;
		try {
			documentDto = getDocumentDto();
			boolean isItNewRecord = isNewRecord();
			saveDocumentMainInfo();
			if (isItNewRecord) {
				this.documentObservableList.add(documentDto);
			} else {
				if (!documentInfoController.isDocumentBill()) {
					billController.billRowService.deleteBillRowByDocumentId(documentDto.getId());
				}
			}
		} catch (Exception e) {
			switchToDocumentInfoTab();
			Alert alert = new Alert(Alert.AlertType.NONE);
			alert.setTitle(APPLICATION_TITLE);
			alert.setAlertType(Alert.AlertType.ERROR);
			alert.setContentText(DEFAULT_ERROR_MESSAGE + e.getMessage());
			alert.show();
			result = false;
		}
		return result;
	}

	public DocumentDto getDocumentDto() {
		return Optional.ofNullable(documentInfoController).map(DocumentInfoController::fillDocumentDto).orElse(null);
	}

	public void enableDocumentButtons() {
		changeDocumentButtonStatus(false);
	}

	public void switchToDocumentInfoTab() {
		documentTabPane.getSelectionModel().select(documentInfoTab);
	}

	private boolean isNewRecord() {
		return this.documentDto != null && this.documentDto.getId() == null;
	}

	public void setDocument(DocumentDto documentDto) {
		this.documentDto = documentDto;
		if (documentDto != null) {
			documentInfoController.fillDocumentFormWithExistData(documentDto);
		}
		actualizeDocumentTabs();
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

	public void disableDocumentButtons() {
		changeDocumentButtonStatus(true);
	}

	public void onPrintDocumentButton() {
		List<BillContentDto> billPositionData = billController.billRowService.getByDocumentId(documentDto.getId());
		JasperPrint jasperPrint = reportService.getReportWithData(billPositionData, documentDto, "BILL", false);
		JasperViewer viewer = new JasperViewer(jasperPrint, false);
		viewer.setVisible(true);

	}

	public void setDocumentInfoSumTotalFieldValue(Double value) {
		documentInfoController.sumTotalField.setText(String.valueOf(value));
		documentInfoController.sumTotalOnAction();
	}

}
