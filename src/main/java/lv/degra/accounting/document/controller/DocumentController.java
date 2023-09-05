package lv.degra.accounting.document.controller;

import javafx.collections.ObservableList;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.scene.control.*;
import javafx.scene.input.KeyCode;
import javafx.scene.input.KeyEvent;
import javafx.stage.Stage;
import lv.degra.accounting.bank.model.Bank;
import lv.degra.accounting.bank.service.BankService;
import lv.degra.accounting.currency.model.Currency;
import lv.degra.accounting.currency.service.CurrencyService;
import lv.degra.accounting.customer.model.Customer;
import lv.degra.accounting.customer.service.CustomerService;
import lv.degra.accounting.customerAccount.model.CustomerBankAccount;
import lv.degra.accounting.customerAccount.service.CustomerAccountService;
import lv.degra.accounting.document.dto.DocumentDto;
import lv.degra.accounting.document.service.DocumentService;
import lv.degra.accounting.exchangeRate.model.CurrencyExchangeRate;
import lv.degra.accounting.exchangeRate.service.ExchangeRateService;
import lv.degra.accounting.system.exception.IncorrectSumException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.function.UnaryOperator;
import java.util.regex.Pattern;

import static lv.degra.accounting.configuration.DegraConfig.*;

@Controller
public class DocumentController {

    @FXML
    public ComboBox publisherCombo;
    @FXML
    public ComboBox publisherBankCombo;
    @FXML
    public ComboBox publisherBankAccountCombo;

    @FXML
    public ComboBox receiverCombo;
    @FXML
    public ComboBox receiverBankCombo;
    @FXML
    public ComboBox receiverBankAccountCombo;

    @Autowired
    private DocumentService documentService;
    @Autowired
    private CurrencyService currencyService;
    @Autowired
    private ExchangeRateService exchangeRateService;
    @Autowired
    private CustomerService customerService;
    @Autowired
    private BankService bankService;
    @Autowired
    private CustomerAccountService customerAccountService;

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
    private ComboBox currencyCombo;
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
                    (Currency) currencyCombo.getValue(),
                    currencyExchangeRate,
                    notesForCustomerField.getText(),
                    internalNotesField.getText(),
                    (Customer) publisherCombo.getValue(),
                    (Bank) publisherBankCombo.getValue(),
                    (CustomerBankAccount) publisherBankAccountCombo.getValue(),
                    (Customer) receiverCombo.getValue(),
                    (Bank) receiverBankCombo.getValue(),
                    (CustomerBankAccount) receiverBankAccountCombo.getValue());

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
        fillCombos();
        setFormat();
        setValues();
    }

    private void setValues() {
        documentDateDp.setValue(LocalDate.now());
        accountingDateDp.setValue(LocalDate.now());
        paymentDateDp.setValue(LocalDate.now().plusDays(DEFAULT_PAY_DAY));

        Currency currencyDefault = currencyService.getDefaultCurrency();
        currencyCombo.setValue(currencyDefault);
        setExchangeRate(currencyDefault);

    }

    private void setFormat() {

        Pattern pattern = Pattern.compile(SUM_FORMAT_REGEX);
        TextFormatter summTotalDoubleFormatter = new TextFormatter((UnaryOperator<TextFormatter.Change>) change -> {
            return pattern.matcher(change.getControlNewText()).matches() ? change : null;
        });
        sumTotalField.setTextFormatter(summTotalDoubleFormatter);
        sumTotalField.setText("0");

        TextFormatter exchangeRateDoubleFormatter = new TextFormatter((UnaryOperator<TextFormatter.Change>) change -> {
            return pattern.matcher(change.getControlNewText()).matches() ? change : null;
        });

        exchangeRateField.setTextFormatter(exchangeRateDoubleFormatter);
    }

    private void fillCombos() {

        currencyCombo.setItems(currencyService.getCurrencyList());

        ObservableList<Customer> customerList = customerService.getCustomerByNameOrRegistrationNumber();
        publisherCombo.setItems(customerList);
        receiverCombo.setItems(customerList);
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

    public void currencyOnAction() {
        Currency selectedCurrency = (Currency) currencyCombo.getValue();
        setExchangeRate(selectedCurrency);
    }

    private void setExchangeRate(Currency currency ){
        currencyExchangeRate = exchangeRateService.getActuallyExchangeRate(accountingDateDp.getValue(),  currency);
        exchangeRateField.setText(currencyExchangeRate.getRate().toString());
    }

    private void setBankInfo(ComboBox customerCombo, ComboBox bankCombo, ComboBox customerBankAccountCombo) {
        Customer customer = (Customer) customerCombo.getValue();

        ObservableList<CustomerBankAccount> observableCustomerAccountsListBank = customerAccountService.getCustomerAccounts(customer);
        List<Integer> uniqueCustomerBankIdList = observableCustomerAccountsListBank.stream().filter(distinctByKey(CustomerBankAccount::getBank)).map(account->account.getBank().getId()).toList();

        ObservableList<Bank> observableCustomerBankList = bankService.getCustomerBanksByBanksIdList(uniqueCustomerBankIdList);

        bankCombo.setItems(observableCustomerBankList);
        if (observableCustomerBankList.size() == 1) {
            Bank bank = observableCustomerBankList.get(0);
            bankCombo.setValue(bank);

            customerBankAccountCombo.setItems(observableCustomerAccountsListBank);
            if (observableCustomerAccountsListBank.size() == 1) {
                CustomerBankAccount customerBankAccount = observableCustomerAccountsListBank.get(0);
                customerBankAccountCombo.setValue(customerBankAccount);
            }
        }


    }

    public void receiverOnAction() {
        setBankInfo(receiverCombo, receiverBankCombo, receiverBankAccountCombo);
    }

    public void publisherOnAction() {
        setBankInfo(publisherCombo, publisherBankCombo, publisherBankAccountCombo);
    }

    public static <T> Predicate<T> distinctByKey(Function<? super T, ?> keyExtractor) {
        Set<Object> seen = ConcurrentHashMap.newKeySet();
        return t -> seen.add(keyExtractor.apply(t));
    }

}
