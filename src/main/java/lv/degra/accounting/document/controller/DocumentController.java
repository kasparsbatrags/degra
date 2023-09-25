package lv.degra.accounting.document.controller;

import javafx.collections.ObservableList;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.scene.control.*;
import lv.degra.accounting.bank.model.Bank;
import lv.degra.accounting.bank.service.BankService;
import lv.degra.accounting.currency.model.Currency;
import lv.degra.accounting.currency.service.CurrencyService;
import lv.degra.accounting.customer.model.Customer;
import lv.degra.accounting.customer.service.CustomerService;
import lv.degra.accounting.customerAccount.model.CustomerBankAccount;
import lv.degra.accounting.customerAccount.service.CustomerAccountService;
import lv.degra.accounting.document.dto.DocumentDto;
import lv.degra.accounting.document.model.Document;
import lv.degra.accounting.document.service.DocumentService;
import lv.degra.accounting.exchange.model.CurrencyExchangeRate;
import lv.degra.accounting.exchange.service.ExchangeService;
import lv.degra.accounting.system.exception.IncorrectSumException;
import lv.degra.accounting.system.utils.DegraController;
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
public class DocumentController extends DegraController {
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
    @FXML
    public Label documentIdLabel;
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
    private TextField sumTotalInCurrencyField;
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
    @Autowired
    private DocumentService documentService;
    @Autowired
    private CurrencyService currencyService;
    @Autowired
    private ExchangeService exchangeService;
    @Autowired
    private CustomerService customerService;
    @Autowired
    private BankService bankService;
    @Autowired
    private CustomerAccountService customerAccountService;
    private CurrencyExchangeRate currencyExchangeRate;
    private DocumentDto documentDto;
    private ObservableList<Document> documentObservableList;

    public static <T> Predicate<T> distinctByKey(Function<? super T, ?> keyExtractor) {
        Set<Object> seen = ConcurrentHashMap.newKeySet();
        return t -> seen.add(keyExtractor.apply(t));
    }

    @FXML
    public void onSaveButton(ActionEvent actionEvent) {
        try {
            Integer id = documentIdLabel.getText().isEmpty() ? null : Integer.parseInt(documentIdLabel.getText());
            documentDto = new DocumentDto(id, numberField.getText(), internalNumberField.getText(), null, accountingDateDp.getValue(), documentDateDp.getValue(), paymentDateDp.getValue(), null, getDouble(sumTotalField.getText()), getDouble(sumTotalInCurrencyField.getText()), (Currency) currencyCombo.getValue(), currencyExchangeRate, notesForCustomerField.getText(), internalNotesField.getText(), (Customer) publisherCombo.getValue(), (Bank) publisherBankCombo.getValue(), (CustomerBankAccount) publisherBankAccountCombo.getValue(), (Customer) receiverCombo.getValue(), (Bank) receiverBankCombo.getValue(), (CustomerBankAccount) receiverBankAccountCombo.getValue());
            Document document = documentService.saveDocument(documentDto);
            if (id == null) {
                this.documentObservableList.add(document);
            }
            closeWindows();
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
        setDefaultValues();
    }

    public void setDocument(DocumentDto documentDto) {
        this.documentDto = documentDto;
        if (this.documentDto != null) {
            fillFormWithExistData(documentDto);
        }
    }

    public void setDocumentList(ObservableList<Document> documentList) {
        this.documentObservableList = documentList;
    }

    private void setDefaultValues() {
        documentDateDp.setValue(LocalDate.now());
        accountingDateDp.setValue(LocalDate.now());
        paymentDateDp.setValue(LocalDate.now().plusDays(DEFAULT_PAY_DAY));
        Currency currencyDefault = currencyService.getDefaultCurrency();
        currencyCombo.setValue(currencyDefault);
        setExchangeRate(currencyDefault);
    }

    private void fillFormWithExistData(DocumentDto documentDto) {
        documentIdLabel.setText(documentDto.getId().toString());
        numberField.setText(documentDto.getDocumentNumber());
        internalNumberField.setText(documentDto.getInternalNumber());
        accountingDateDp.setValue(documentDto.getAccountingDate());
        documentDateDp.setValue(documentDto.getDocumentDate());
        paymentDateDp.setValue(documentDto.getPaymentDate());
        sumTotalField.setText(documentDto.getSumTotal().toString());
        sumTotalInCurrencyField.setText(documentDto.getSumTotalInCurrency().toString());
        exchangeRateField.setText(documentDto.getCurrencyExchangeRate().getRate().toString());
        currencyCombo.setValue(documentDto.getCurrency());
        publisherCombo.setValue(documentDto.getPublisherCustomer());
        publisherBankCombo.setValue(documentDto.getPublisherCustomerBank());
        publisherBankAccountCombo.setValue(documentDto.getPublisherCustomerBankAccount());
        receiverCombo.setValue(documentDto.getReceiverCustomer());
        receiverBankCombo.setValue(documentDto.getReceiverCustomerBank());
        receiverBankAccountCombo.setValue(documentDto.getReceiverCustomerBankAccount());
        notesForCustomerField.setText(documentDto.getNotesForCustomer());
        internalNotesField.setText(documentDto.getInternalNotes());
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

    private void setExchangeRate(Currency currency) {
        currencyExchangeRate = exchangeService.getActuallyExchangeRate(accountingDateDp.getValue(), currency);
        exchangeRateField.setText(currencyExchangeRate.getRate().toString());
    }

    private void setBankInfo(ComboBox customerCombo, ComboBox bankCombo, ComboBox accountCombo) {
        Customer customer = (Customer) customerCombo.getValue();

        ObservableList<CustomerBankAccount> observableAccountsListBank = customerAccountService.getCustomerAccounts(customer);
        List<Integer> uniqueCustomerBankIdList = observableAccountsListBank.stream().filter(distinctByKey(CustomerBankAccount::getBank)).map(account -> account.getBank().getId()).toList();

        ObservableList<Bank> observableCustomerBankList = bankService.getCustomerBanksByBanksIdList(uniqueCustomerBankIdList);

        bankCombo.setItems(observableCustomerBankList);
        if (observableCustomerBankList.size() == 1) {
            Bank bank = observableCustomerBankList.get(0);
            bankCombo.setValue(bank);

            accountCombo.setItems(observableAccountsListBank);
            if (observableAccountsListBank.size() == 1) {
                CustomerBankAccount customerBankAccount = observableAccountsListBank.get(0);
                accountCombo.setValue(customerBankAccount);
            }
        } else {
            accountCombo.setItems(null);
            accountCombo.setValue(null);
        }
    }

    private void setBankAccountInfo(ComboBox customerCombo, ComboBox bankCombo, ComboBox accountCombo) {
        Customer selectedCustomer = (Customer) customerCombo.getValue();
        Bank selectedBank = (Bank) bankCombo.getValue();
        if (selectedBank != null) {
            ObservableList<CustomerBankAccount> customerBankAccounts = customerAccountService.getCustomerBankAccounts(selectedCustomer, selectedBank);
            if (customerBankAccounts.size() == 1) {
                CustomerBankAccount account = customerBankAccounts.get(0);
                accountCombo.setValue(account);
            } else {
                accountCombo.setItems(customerBankAccounts);
            }
        } else {
            accountCombo.setItems(null);
            accountCombo.setValue(null);
        }
    }

    public void receiverOnAction() {
        setBankInfo(receiverCombo, receiverBankCombo, receiverBankAccountCombo);
    }

    public void receiverBankOnAction(ActionEvent actionEvent) {
        setBankAccountInfo(receiverCombo, receiverBankCombo, receiverBankAccountCombo);
    }

    public void publisherOnAction() {
        setBankInfo(publisherCombo, publisherBankCombo, publisherBankAccountCombo);
    }

    public void publisherBankOnAction(ActionEvent actionEvent) {
        setBankAccountInfo(publisherCombo, publisherBankCombo, publisherBankAccountCombo);
    }
}
