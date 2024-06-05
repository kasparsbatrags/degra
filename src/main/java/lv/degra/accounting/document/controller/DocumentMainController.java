package lv.degra.accounting.document.controller;

import javafx.collections.ObservableList;
import javafx.fxml.FXML;
import javafx.scene.control.Alert;
import javafx.scene.control.Button;
import javafx.scene.control.Tab;
import javafx.scene.control.TabPane;
import lv.degra.accounting.document.dto.BillContentDto;
import lv.degra.accounting.document.dto.DocumentDto;
import lv.degra.accounting.document.service.DocumentService;
import lv.degra.accounting.report.service.ReportService;
import lv.degra.accounting.system.utils.DegraController;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.view.JasperViewer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

import static lv.degra.accounting.system.configuration.DegraConfig.APPLICATION_TITLE;
import static lv.degra.accounting.system.configuration.DegraConfig.DEFAULT_ERROR_MESSAGE;

@Component
public class DocumentMainController extends DegraController {

    private final DocumentInfoController documentInfoController;
    private final BillController billController;
    private final DocumentService documentService;
    private final ReportService reportService;
    public DocumentDto documentDto;
    @FXML
    public TabPane documentTabPane;
    @FXML
    public Tab documentInfoTab;
    @FXML
    public Button saveButton;
    private ObservableList<DocumentDto> documentObservableList;
    @FXML
    private Tab billContentTab;

    @Autowired
    public DocumentMainController(DocumentInfoController documentInfoController, BillController billController, DocumentService documentService, ReportService reportService) {
        this.documentInfoController = documentInfoController;
        this.billController = billController;
        this.documentService = documentService;
        this.reportService = reportService;
    }

    @FXML
    private void initialize() {
        documentInfoController.injectMainController(this);
        billController.injectMainController(this);
        actualizeDocumentTabs();
    }

    @FXML
    public void onSaveDocumentButton() {
        if (saveDocument()) {
            closeWindows();
        }
    }

    @FXML
    public void billContentOpenAction() {
        billController.setBillContentOpenAction();
    }

    public void actualizeDocumentTabs() {
        if (documentInfoController.isDocumentBill()) {
            showBillTab();
        } else {
            hideBillTab();
        }
    }

    protected void saveDocumentMainInfo() {
        documentService.saveDocument(documentDto);
    }

    public boolean saveDocument() {
        boolean result = true;
        try {
            documentDto = documentInfoController.fillDocumentDto();
            boolean isItNewRecord = isItNewRecord();
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

    private boolean isItNewRecord() {
        return this.documentDto != null && this.documentDto.getId() == null;
    }

    public void setDocument(DocumentDto documentDto) {
        this.documentDto = documentDto;
        if (documentDto != null) {
            documentInfoController.fillDocumentFormWithExistData(documentDto);
        }
        showBillTab();
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
