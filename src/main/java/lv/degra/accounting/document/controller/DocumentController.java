package lv.degra.accounting.document.controller;

import javafx.beans.value.ChangeListener;
import javafx.beans.value.ObservableValue;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.scene.control.*;
import javafx.scene.input.KeyCode;
import javafx.scene.input.KeyEvent;
import javafx.stage.Stage;
import javafx.util.converter.FloatStringConverter;
import lv.degra.accounting.currency.model.Currency;
import lv.degra.accounting.currency.service.CurrencyService;
import lv.degra.accounting.document.dto.DocumentDto;
import lv.degra.accounting.document.service.DocumentService;
import lv.degra.accounting.system.exception.IncorrectSumException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;

import java.util.function.UnaryOperator;
import java.util.regex.Pattern;

import static lv.degra.accounting.DegraApplication.APPLICATION_TITLE;

@Controller
public class DocumentController {

    @Autowired
    private DocumentService documentService;

    @Autowired
    private CurrencyService currencyService;

    private DocumentDto documentDto;

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
    private ComboBox exchangeCombo;
    @FXML
    private TextField exchangeField;
    @FXML
    private TextField exchangeRateField;
    @FXML
    private Button saveButton;
    @FXML
    private Button closeButton;

    public static void numericOnly(final TextField field) {
        field.textProperty().addListener(new ChangeListener<String>() {
            @Override
            public void changed(
                    ObservableValue<? extends String> observable,
                    String oldValue, String newValue) {
                if (!newValue.matches("\\d*")) {
                    field.setText(newValue.replaceAll("[^\\d]", ""));
                }
            }
        });
    }

    @FXML
    public void onKeyPressEscapeAction(KeyEvent keyEvent) {
        KeyCode key = keyEvent.getCode();
        if (key == KeyCode.ESCAPE) {
            closeWindows();
        }
    }

    @FXML
    public void onSaveButton(ActionEvent actionEvent) {
        try {
            DocumentDto documentDto = new DocumentDto(
                    null,
                    numberField.getText(),
                    internalNumberField.getText(),
                    null,
                    accountingDateDp.getValue(),
                    documentDateDp.getValue(),
                    paymentDateDp.getValue(),
                    null,
                    getDouble(sumTotalField.getText()),
                    currencyService.getDefaultCurrency(),
                    exchangeRateField.getText());

            documentService.createDocument(documentDto);
        } catch (Exception e) {
            Alert alert = new Alert(Alert.AlertType.NONE);
            alert.setTitle(APPLICATION_TITLE);
            alert.setAlertType(Alert.AlertType.ERROR);
            alert.setContentText(e.getMessage());
            alert.show();
        }

    }

    @FXML
    public void initialize() {
        sumTotalField.setTextFormatter(new TextFormatter<>(new FloatStringConverter()));
        exchangeCombo.setItems(currencyService.getCurrencyList());


        Pattern pattern = Pattern.compile("\\d*|\\d+\\.\\d*");
        TextFormatter summTotalDoubleFormatter = new TextFormatter((UnaryOperator<TextFormatter.Change>) change -> {
            return pattern.matcher(change.getControlNewText()).matches() ? change : null;
        });
        sumTotalField.setTextFormatter(summTotalDoubleFormatter);
        sumTotalField.setText("0");

        TextFormatter exchangeRateDoubleFormatter = new TextFormatter((UnaryOperator<TextFormatter.Change>) change -> {
            return pattern.matcher(change.getControlNewText()).matches() ? change : null;
        });

        exchangeRateField.setTextFormatter(exchangeRateDoubleFormatter);
        exchangeRateField.setText("1");

        exchangeCombo.setValue(currencyService.getDefaultCurrency());
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
        double result;
        try {
            result = Double.parseDouble(totalSum);
        } catch (RuntimeException e) {
            throw new IncorrectSumException("Nav iespējams nolasīt summu!");
        }
        return result;
    }

    public void onChangeExchangeCombo(ActionEvent event) {
        Currency currency = (Currency) exchangeCombo.getSelectionModel().getSelectedItem();
        documentDto.setCurrencyId(currency.getId());
        System.out.println(currency.getId());
    }

    public void onChangeSumTotalField(ActionEvent actionEvent) {

    }

}
