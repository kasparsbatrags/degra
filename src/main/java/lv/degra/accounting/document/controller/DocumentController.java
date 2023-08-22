package lv.degra.accounting.document.controller;

import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.scene.control.Button;
import javafx.scene.control.DatePicker;
import javafx.scene.control.TextArea;
import javafx.scene.control.TextField;
import javafx.scene.input.KeyCode;
import javafx.scene.input.KeyEvent;
import javafx.stage.Stage;
import lv.degra.accounting.document.Dto.DocumentDto;
import lv.degra.accounting.document.service.DocumentService;
import lv.degra.accounting.system.exception.IncorrectSumException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;

@Controller
public class DocumentController {

    @Autowired
    DocumentService documentService;
    @FXML
    private TextArea notesForCustomerField;
    @FXML
    private TextArea internalNotesField;
    @FXML
    private TextField numberField;
    @FXML
    private TextField internalNumberField;
    @FXML
    private DatePicker accountingDateDp;
    @FXML
    private DatePicker documentDateDp;
    @FXML
    private DatePicker paymentDateDp;
    @FXML
    private TextField sumTotalField;
    @FXML
    private TextField exchangeField;
    @FXML
    private TextField exchangeRateField;
    @FXML
    private Button saveButton;
    @FXML
    private Button closeButton;

    @FXML
    public void onKeyPressEscapeAction(KeyEvent keyEvent) {
        KeyCode key = keyEvent.getCode();
        if (key == KeyCode.ESCAPE) {
            closeWindows();
        }
    }

    @FXML
    public void onSaveButton(ActionEvent actionEvent) {

    }

    @FXML
    public void initialize() {
        saveButton.setOnMouseClicked(event -> {
            DocumentDto documentDto = new DocumentDto();
            documentDto.setNumber(numberField.getText());
            documentDto.setInternalNumber(internalNumberField.getText());
            documentDto.setAccountingDate(accountingDateDp.getValue());
            documentDto.setDocumentDate(documentDateDp.getValue());
            documentDto.setPaymentDate(paymentDateDp.getValue());
            documentDto.setSumTotal(getDouble(sumTotalField.getText()));
            documentDto.setCurrency(exchangeField.getText());
            documentDto.setExchangeRate(getDouble(exchangeRateField.getText()));
            documentDto.setNotesForCustomer(notesForCustomerField.getText());
            documentDto.setInternalNotes(internalNotesField.getText());
//            saveDocument(documentDto);
            documentService.createDocument(documentDto);
        });
    }


    private void saveDocument(DocumentDto documentDto) {
        documentService.createDocument(documentDto);
    }

    @FXML
    public void onCloseButton(ActionEvent actionEvent) {
        closeWindows();
    }


    private void closeWindows() {
        Stage stage = (Stage) closeButton.getScene().getWindow();
        stage.close();
    }

    private Double getDouble(String totalSum) {
        Double result = 0.0;
        try {
            result = Double.parseDouble(totalSum);
        } catch (RuntimeException e) {
            new IncorrectSumException("Nav iespējams nolasīt summu!");
        }
        return result;
    }
}
