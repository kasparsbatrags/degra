package lv.degra.accounting.document.controller;

import javafx.beans.value.ChangeListener;
import javafx.beans.value.ObservableValue;
import javafx.collections.ObservableList;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.scene.control.*;
import javafx.scene.input.KeyCode;
import javafx.scene.input.KeyEvent;
import javafx.stage.Stage;
import javafx.util.converter.FloatStringConverter;
import lv.degra.accounting.currency.model.Currency;
import lv.degra.accounting.currency.service.CurrencyService;
import lv.degra.accounting.customer.model.Customer;
import lv.degra.accounting.customer.service.CustomerService;
import lv.degra.accounting.document.dto.DocumentDto;
import lv.degra.accounting.document.model.Document;
import lv.degra.accounting.document.service.DocumentService;
import lv.degra.accounting.exchange.model.CurrencyExchangeRate;
import lv.degra.accounting.exchange.service.ExchangeRateService;
import lv.degra.accounting.system.exception.IncorrectSumException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;

import java.time.LocalDate;
import java.util.function.UnaryOperator;
import java.util.regex.Pattern;

import static lv.degra.accounting.DegraApplication.APPLICATION_TITLE;
import static lv.degra.accounting.DegraApplication.DEFAULT_PAY_DAY;

@Controller
public class DocumentController {

    @FXML
    public ComboBox publisherCombo;
    @FXML
    public ComboBox receiverCombo;
    @Autowired
    private DocumentService documentService;
    @Autowired
    private CurrencyService currencyService;
    @Autowired
    private ExchangeRateService exchangeRateService;
    @Autowired
    private CustomerService customerService;
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
    private ComboBox curencyCombo;
    @FXML
    private TextField exchangeRateField;
    @FXML
    private TextArea notesForCustomerField;
    @FXML
    private TextArea internalNotesField;

    @FXML
    private Button saveButton;
    @FXML
    private Button closeButton;

    private CurrencyExchangeRate currencyExchangeRate;

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
            Currency documentCurrency = currencyService.getDefaultCurrency();
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
                    (Currency) curencyCombo.getValue(),
                    currencyExchangeRate,
                    notesForCustomerField.getText(),
                    internalNotesField.getText(),
                    (Customer) publisherCombo.getValue(),
                    (Customer) receiverCombo.getValue());

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

        TextArea notesForCustomerField = new TextArea();
        TextArea internalNotesField = new TextArea();

        documentDateDp.setValue(LocalDate.now());
        accountingDateDp.setValue(LocalDate.now());
        paymentDateDp.setValue(LocalDate.now().plusDays(DEFAULT_PAY_DAY));

        ObservableList<Customer> customerList = customerService.getCustomerByNameOrRegistrationNumber();

        publisherCombo.setItems(customerList);
        receiverCombo.setItems(customerList);


        sumTotalField.setTextFormatter(new TextFormatter<>(new FloatStringConverter()));
        curencyCombo.setItems(currencyService.getCurrencyList());



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

        curencyCombo.setValue(currencyService.getDefaultCurrency());
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

    public void currencyOnAction(ActionEvent actionEvent) {
        Currency selectedCurrency = (Currency) curencyCombo.getValue();
        currencyExchangeRate = exchangeRateService.getActuallyExchangeRate(accountingDateDp.getValue(), selectedCurrency);
        exchangeRateField.setText(currencyExchangeRate.getRate().toString());
    }
}
