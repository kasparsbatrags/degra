package lv.degra.accounting.document.controller;

import javafx.beans.property.SimpleStringProperty;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.control.TableColumn;
import javafx.scene.control.TableView;
import javafx.scene.control.cell.PropertyValueFactory;
import javafx.scene.input.KeyCode;
import javafx.scene.input.KeyEvent;
import javafx.stage.Modality;
import javafx.stage.Stage;
import lv.degra.accounting.document.model.Document;
import lv.degra.accounting.document.service.DocumentService;
import lv.degra.accounting.system.utils.DegraController;
import lv.degra.accounting.system.utils.DegraFormBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Controller;

import java.io.IOException;
import java.time.LocalDate;

@Controller
public class DocumentListController extends DegraController {

    @Autowired
    DegraFormBuilder degraFormBuilder;
    @Autowired
    ApplicationContext context;
    @Autowired
    private DocumentService documentService;
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

    @FXML
    public void initialize() {

        documentDateColumn.setCellValueFactory(new PropertyValueFactory<Document, LocalDate>("documentDate"));
        documentNumberColumn.setCellValueFactory(new PropertyValueFactory<Document, String>("documentNumber"));
        sumTotalColumn.setCellValueFactory(new PropertyValueFactory<Document, Double>("sumTotal"));
        currencyColumn.setCellValueFactory(document -> new SimpleStringProperty(document.getValue().getCurrency().getCurrencyName()));
        exchangeRateColumn.setCellValueFactory(document -> new SimpleStringProperty(document.getValue().getExchangeRate().getRate().toString()));
        documentTableView.setItems(documentService.getDocumentList());
    }

    @FXML
    public void onKeyPressAction(KeyEvent keyEvent) {
        KeyCode key = keyEvent.getCode();
        if (key == KeyCode.INSERT) {
            addNewDocument();
            closeWindows();
        }
    }

    private void addNewDocument() {
        FXMLLoader fxmlLoader = new FXMLLoader(getClass().getResource("/document/document.fxml"));
        fxmlLoader.setControllerFactory(context::getBean);
        Parent root1 = null;
        try {
            root1 = fxmlLoader.load();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        Stage stage = new Stage();

        stage.setTitle("Lecture Input");
        stage.setScene(new Scene(root1));
        stage.setResizable(false);

        stage.initModality(Modality.APPLICATION_MODAL);

        stage.showAndWait();
    }
}
