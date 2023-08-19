package lv.degra.accounting.documents.controller;

import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.scene.control.Button;
import javafx.scene.control.TextField;
import javafx.scene.input.KeyCode;
import javafx.scene.input.KeyEvent;
import javafx.stage.Stage;
import lv.degra.accounting.documents.service.DocumentService;
import org.springframework.beans.factory.annotation.Autowired;

public class DocumentController {


    @FXML
    private TextField accountingDateField;

    @FXML
    private Button closeButton;

    @FXML
    private TextField documentDateField;

    @FXML
    private TextField exchangeField;


    @FXML
    private TextField exchangeRateField;


    @FXML
    private TextField numberField;


    @FXML
    private TextField paymentDateField;


    @FXML
    private Button saveButton;

    @FXML
    private TextField sumField;


    @FXML
    public void onKeyPressEscapeAction(KeyEvent keyEvent) {
        KeyCode key = keyEvent.getCode();
        if (key == KeyCode.ESCAPE) {
            closeWindows();
        }
    }

    @Autowired
    DocumentService documentService;

    @FXML
    public void onSaveButton(ActionEvent actionEvent) {
        System.out.print("SAVE");
        closeWindows();
    }

    @FXML
    public void onCloseButton(ActionEvent actionEvent) {
        closeWindows();
    }


    private void closeWindows(){
        Stage stage = (Stage) closeButton.getScene().getWindow();
        stage.close();
    }

}
