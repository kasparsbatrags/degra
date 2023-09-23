package lv.degra.accounting.document.controller;

import javafx.beans.property.SimpleStringProperty;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.control.TableColumn;
import javafx.scene.control.TableView;
import javafx.scene.control.cell.PropertyValueFactory;
import javafx.scene.input.KeyCode;
import javafx.scene.input.KeyEvent;
import javafx.stage.Modality;
import javafx.stage.Stage;
import lv.degra.accounting.configuration.mapper.BaseMapperConfig;
import lv.degra.accounting.document.dto.DocumentDto;
import lv.degra.accounting.document.model.Document;
import lv.degra.accounting.document.service.DocumentService;
import lv.degra.accounting.system.exception.FxmlFileLoaderException;
import lv.degra.accounting.system.utils.ApplicationFormBuilder;
import lv.degra.accounting.system.utils.DegraController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Controller;

import java.io.IOException;
import java.time.LocalDate;

@Controller
public class DocumentListController extends DegraController {

    private static final String DOCUMENT_SCREEN_FILE = "/document/document.fxml";
    private static final String EDIT_DOCUMENT_TITLE = "Rediģēt dokumentu";
    private static final String CRATE_DOCUMENT_TITLE = "Izveidot dokumentu";
    @Autowired
    ApplicationFormBuilder applicationFormBuilder;
    @Autowired
    ApplicationContext context;
    ObservableList<Document> documentObservableList = FXCollections.observableArrayList();
    @FXML
    private TableView<Document> documentTableView = new TableView<>();
    @FXML
    private TableColumn<Document, LocalDate> documentDateColumn;
    @FXML
    private TableColumn<Document, String> documentNumberColumn;
    @FXML
    private TableColumn<Document, Double> sumTotalColumn;
    @FXML
    private TableColumn<Document, String> currencyColumn;
    @FXML
    private TableColumn<Document, String> exchangeRateColumn;
    @FXML
    private TableColumn<Document, String> sumTotalInCurrencyColumn;
    private Document document = null;
    @Autowired
    private DocumentService documentService;

    @FXML
    public void initialize() {
        loadData();
    }


    private void refreshTable() {
        documentObservableList.clear();
        documentService.getDocumentList().forEach(document -> documentObservableList.add(document));
        documentTableView.setItems(documentObservableList);
    }

    private void loadData() {
        refreshTable();
        documentDateColumn.setCellValueFactory(new PropertyValueFactory<Document, LocalDate>("documentDate"));
        documentNumberColumn.setCellValueFactory(new PropertyValueFactory<Document, String>("documentNumber"));
        sumTotalColumn.setCellValueFactory(new PropertyValueFactory<Document, Double>("sumTotal"));
        currencyColumn.setCellValueFactory(document -> new SimpleStringProperty(document.getValue().getCurrency().getCurrencyName()));
        exchangeRateColumn.setCellValueFactory(document -> new SimpleStringProperty(document.getValue().getExchangeRate().getRate().toString()));
        documentTableView.requestFocus();
    }

    @FXML
    public void onKeyPressAction(KeyEvent keyEvent) {
        KeyCode key = keyEvent.getCode();
        if (key == KeyCode.INSERT) {
            openDocument(null);
        } else if (key == KeyCode.ENTER) {
            document = documentTableView.getSelectionModel().getSelectedItem();
            if (document == null) {
                return;
            }
            openDocument(documentService.mapToDto(document));
        }
    }

    private void openDocument(DocumentDto documentDto) {
        FXMLLoader fxmlLoader = new FXMLLoader(getClass().getResource(DOCUMENT_SCREEN_FILE));
        fxmlLoader.setControllerFactory(context::getBean);
        try {
            fxmlLoader.load();
            Parent root1 = fxmlLoader.getRoot();
            Stage stage = applicationFormBuilder.getApplicationFormatedStage(root1, documentDto == null ? CRATE_DOCUMENT_TITLE : EDIT_DOCUMENT_TITLE);
            DocumentController documentController = fxmlLoader.getController();
            if (isCreateNewDocument(documentDto)) {
                documentController.setDocumentList(documentObservableList);
            } else {
                documentController.setDocumentList(documentObservableList);
                documentController.setDocument(documentDto);
            }
            stage.initModality(Modality.WINDOW_MODAL);
            stage.setMaximized(true);
            stage.showAndWait();
            if (!isCreateNewDocument(documentDto)) {
                loadData();
            }
        } catch (RuntimeException | IOException e) {
            throw new FxmlFileLoaderException(e.getMessage());
        }
    }

    private boolean isCreateNewDocument(DocumentDto documentDto) {
        return documentDto == null;
    }
}