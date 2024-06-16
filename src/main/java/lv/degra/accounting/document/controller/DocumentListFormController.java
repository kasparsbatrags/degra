package lv.degra.accounting.document.controller;

import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.control.Button;
import javafx.stage.Stage;
import lv.degra.accounting.document.bill.service.BillRowService;
import lv.degra.accounting.document.dto.DocumentDto;
import lv.degra.accounting.document.service.DocumentService;
import lv.degra.accounting.system.exception.DegraRuntimeException;
import lv.degra.accounting.system.object.DynamicTableView;
import lv.degra.accounting.system.utils.ApplicationFormBuilder;
import lv.degra.accounting.system.utils.DegraController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Controller;

import static javafx.stage.Modality.APPLICATION_MODAL;
import static lv.degra.accounting.system.configuration.DegraConfig.CRATE_FORM_TITLE;
import static lv.degra.accounting.system.configuration.DegraConfig.EDIT_FORM_TITLE;

@Controller
public class DocumentListFormController extends DegraController {

    private static final String DOCUMENT_SCREEN_FILE = "/document/DocumentForm.fxml";
    private final ObservableList<DocumentDto> documentObservableList = FXCollections.observableArrayList();
    @FXML
    public Button newButton;
    @Autowired
    private ApplicationFormBuilder applicationFormBuilder;
    @Autowired
    private ApplicationContext context;

    @Autowired
    private DocumentService documentService;
    @Autowired
    private BillRowService billRowService;
    @FXML
    private DynamicTableView<DocumentDto> documentListView = new DynamicTableView<>();

    @FXML
    public void initialize() {
        documentListView.setType(DocumentDto.class);
        documentListView.setCreator(item -> {
            addRecord();
            refreshTable();
        });
        documentListView.setUpdater(item -> editRecord());
        documentListView.setDeleter(item -> {
            deleteRecord();
            refreshTable();
        });

        refreshTable();
    }

    public void onNewButton() {
        openDocumentEditForm(null);
    }

    private void refreshTable() {
        documentObservableList.clear();
        documentObservableList.addAll(documentService.getDocumentList());
        documentListView.setData(documentObservableList);
    }

    @Override
    protected void addRecord() {
        openDocumentEditForm(null);
    }

    @Override
    protected void editRecord() {
        DocumentDto newDocumentDto = getRowFromTableView(documentListView);
        if (newDocumentDto == null) {
            return;
        }
        openDocumentEditForm(newDocumentDto);
    }

    @Override
    protected void deleteRecord() {
        DocumentDto newDocumentDto = getRowFromTableView(documentListView);
        if (newDocumentDto == null) {
            return;
        }
        billRowService.deleteBillRowByDocumentId(newDocumentDto.getId());
        if (newDocumentDto.getId() != null) {
            documentService.deleteDocumentById(newDocumentDto.getId());
        }
        documentListView.getItems().removeAll(newDocumentDto);
    }

    private void openDocumentEditForm(DocumentDto documentDto) {
        FXMLLoader fxmlLoader = new FXMLLoader(getClass().getResource(DOCUMENT_SCREEN_FILE));
        fxmlLoader.setControllerFactory(context::getBean);
        try {
            Parent root1 = fxmlLoader.load();
            Stage stage = applicationFormBuilder.getApplicationFormatedStage(root1, documentDto == null ? CRATE_FORM_TITLE : EDIT_FORM_TITLE);
            DocumentMainController documentMainController = fxmlLoader.getController();
            if (isCreateNewDocument(documentDto)) {
                documentMainController.setDocumentList(documentObservableList);
            } else {
                documentMainController.setDocumentList(documentObservableList);
                documentMainController.setDocument(documentDto);
            }
			documentMainController.setDocumentDtoOld();
            stage.setMaximized(true);
            stage.initModality(APPLICATION_MODAL);
            stage.showAndWait();
            refreshTable();
        } catch (RuntimeException ex) {
            Throwable rootCause = ex.getCause();
            if (rootCause != null) {
                rootCause.printStackTrace();
            } else {
                ex.printStackTrace();
            }
        } catch (Exception e) {
            throw new DegraRuntimeException(e.getMessage(), e);
        }
    }

    private boolean isCreateNewDocument(DocumentDto documentDto) {
        return documentDto == null;
    }
}