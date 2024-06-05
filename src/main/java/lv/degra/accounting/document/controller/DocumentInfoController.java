package lv.degra.accounting.document.controller;

import javafx.beans.Observable;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.fxml.FXML;
import javafx.scene.control.*;
import javafx.util.Callback;
import lv.degra.accounting.bank.model.Bank;
import lv.degra.accounting.bank.service.BankService;
import lv.degra.accounting.currency.model.Currency;
import lv.degra.accounting.currency.service.CurrencyService;
import lv.degra.accounting.customer.model.Customer;
import lv.degra.accounting.customer.service.CustomerService;
import lv.degra.accounting.customer_account.model.CustomerAccount;
import lv.degra.accounting.customer_account.service.CustomerAccountService;
import lv.degra.accounting.document.dto.DocumentDto;
import lv.degra.accounting.document.dto.DocumentDtoValidator;
import lv.degra.accounting.document.enums.DocumentDirection;
import lv.degra.accounting.document.model.DocumentTransactionType;
import lv.degra.accounting.document.model.DocumentType;
import lv.degra.accounting.document.service.DocumentTransactionTypeService;
import lv.degra.accounting.document.service.DocumentTypeService;
import lv.degra.accounting.exchange.model.CurrencyExchangeRate;
import lv.degra.accounting.exchange.service.ExchangeService;
import lv.degra.accounting.system.configuration.service.ConfigService;
import lv.degra.accounting.system.exception.IllegalDataArgumentException;
import lv.degra.accounting.system.object.ComboBoxWithErrorLabel;
import lv.degra.accounting.system.object.DatePickerWithErrorLabel;
import lv.degra.accounting.system.object.lazycombo.SearchableComboBox;
import lv.degra.accounting.system.utils.DegraController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.stream.Collectors;

import static liquibase.util.StringUtil.isNotEmpty;
import static lv.degra.accounting.document.DocumentFieldsUtils.getDouble;
import static lv.degra.accounting.document.DocumentFieldsUtils.setFieldFormat;
import static lv.degra.accounting.system.configuration.DegraConfig.*;

@Component
public class DocumentInfoController extends DegraController {

    private static final String DEFAULT_DOUBLE_FIELDS_TEXT = "0";
    private static final String BILL_CODE = "BILL";
    @FXML
    public ComboBox<DocumentTransactionType> documentTransactionTypeCombo;
    @FXML
    public SearchableComboBox<Customer> publisherCombo;
    @FXML
    public ComboBox<Bank> publisherBankCombo;
    @FXML
    public ComboBox<CustomerAccount> publisherBankAccountCombo;
    @FXML
    public SearchableComboBox<Customer> receiverCombo;
    @FXML
    public ComboBox<Bank> receiverBankCombo;
    @FXML
    public ComboBox<CustomerAccount> receiverBankAccountCombo;
    @FXML
    public ComboBoxWithErrorLabel<DocumentDirection> directionCombo;
    @FXML
    public ComboBox<Currency> currencyCombo;
    @FXML
    public Label documentIdLabel;
    @FXML
    public TextField seriesField;
    @FXML
    public TextField numberField;
    @FXML
    public TextField sumTotalField;
    @FXML
    public TextField sumTotalInCurrencyField;
    @FXML
    public TextField exchangeRateField;
    @FXML
    public DatePickerWithErrorLabel accountingDateDp;
    @FXML
    public DatePickerWithErrorLabel documentDateDp;
    @FXML
    public DatePickerWithErrorLabel paymentDateDp;
    @FXML
    public TextArea notesForCustomerField;
    @FXML
    public TextArea internalNotesField;
    @FXML
    public ComboBoxWithErrorLabel<DocumentType> documentTypeCombo;
    private DocumentMainController documentMainController;
    @Autowired
    private CurrencyService currencyService;

    private CurrencyExchangeRate currencyExchangeRate;
    @Autowired
    private DocumentTypeService documentTypeService;
    @Autowired
    private DocumentTransactionTypeService documentTransactionTypeService;
    @Autowired
    private ExchangeService exchangeService;
    @Autowired
    private CustomerService customerService;
    @Autowired
    private BankService bankService;
    @Autowired
    private CustomerAccountService customerAccountService;
    @Autowired
    private ConfigService configService;
    @Autowired
    private ConfigurableApplicationContext springContext;

    public static <T> Predicate<T> getDistinctValues(Function<? super T, ?> keyExtractor) {
        Set<Object> seen = ConcurrentHashMap.newKeySet();
        return t -> seen.add(keyExtractor.apply(t));
    }

    private void handleSumTotalFocusChange(Observable observable, boolean oldValue, boolean newValue) {
        if (!newValue) {
            sumTotalOnAction();
        }
    }

    public void initialize() {

        sumTotalField.focusedProperty().addListener(this::handleSumTotalFocusChange);

        exchangeRateField.focusedProperty().addListener((observable, oldValue, newValue) -> {
            if (!newValue) {
                sumTotalOnAction();
            }
        });

        notesForCustomerField.setOnKeyPressed(event -> {
            if (event.getCode().equals(javafx.scene.input.KeyCode.TAB)) {
                event.consume();
                internalNotesField.requestFocus();
            }
        });

        internalNotesField.setOnKeyPressed(event -> {
            if (event.getCode().equals(javafx.scene.input.KeyCode.TAB)) {
                event.consume();
                documentMainController.saveButton.requestFocus();
            }
        });
        documentTypeCombo.setOnAction(event -> this.documentMainController.actualizeDocumentTabs());
        fillDocumentInfoDataCombos();
        setFieldFormat(sumTotalField, SUM_FORMAT_REGEX);
        setFieldFormat(sumTotalInCurrencyField, SUM_FORMAT_REGEX);
        setDefaultValues();

        publisherCombo.setCustomerService(customerService);
        receiverCombo.setCustomerService(customerService);

    }

    @FXML
    public void sumTotalOnAction() {
        sumTotalInCurrencyField.setText(calculateCurrencyTotal(sumTotalField.getText(), exchangeRateField.getText()));
    }

    private String calculateCurrencyTotal(String sum, String rate) {
        double total = getDouble(sum) * getDouble(rate);
        return String.valueOf(total);
    }

    @FXML
    public void receiverOnAction() {
        setBankInfo(receiverCombo, receiverBankCombo, receiverBankAccountCombo);
    }

    @FXML
    public void receiverBankOnAction() {
        setCustomerAccountInfo(receiverCombo, receiverBankCombo, receiverBankAccountCombo);
    }

    @FXML
    public void publisherOnAction() {
        setBankInfo(publisherCombo, publisherBankCombo, publisherBankAccountCombo);
    }

    @FXML
    public void publisherBankOnAction() {
        setCustomerAccountInfo(publisherCombo, publisherBankCombo, publisherBankAccountCombo);
    }

    public void injectMainController(DocumentMainController documentMainController) {
        this.documentMainController = documentMainController;
    }

    public boolean isDocumentBill() {
        return Optional.ofNullable(documentTypeCombo).map(ComboBoxWithErrorLabel::getValue).map(DocumentType::getCode).map(BILL_CODE::equals).orElse(false);
    }

    public void setCustomerAccountInfo(SearchableComboBox customerCombo, ComboBox bankCombo, ComboBox accountCombo) {
        Customer selectedCustomer = (Customer) customerCombo.getValue();
        Bank selectedBank = (Bank) bankCombo.getValue();
        if (selectedBank != null) {
            ObservableList<CustomerAccount> customerBankAccounts = FXCollections.observableList(customerAccountService.getCustomerBankAccounts(selectedCustomer, selectedBank));
            if (customerBankAccounts.size() == 1) {
                CustomerAccount account = customerBankAccounts.get(0);
                accountCombo.setItems(customerBankAccounts);
                accountCombo.setValue(account);
            } else {
                accountCombo.setItems(customerBankAccounts);
                if (customerBankAccounts.size() == 1) {
                    accountCombo.setValue(customerBankAccounts.get(0));
                } else {
                    accountCombo.setValue(null);
                }
            }
        }
    }

    public void setBankInfo(SearchableComboBox<Customer> customerCombo, ComboBox<Bank> bankCombo, ComboBox<CustomerAccount> accountCombo) {
        Customer selectedCustomer = customerCombo.getValue();
        if (selectedCustomer == null) {
            accountCombo.setValue(null);
            bankCombo.setValue(null);
            return;
        }

        List<CustomerAccount> accountsList = customerAccountService.getCustomerAccounts(selectedCustomer);
        Set<Integer> uniqueCustomerBankIdSet = accountsList.stream().map(account -> account.getBank().getId()).collect(Collectors.toSet());

        ObservableList<Bank> customerBankList = FXCollections.observableList(bankService.getCustomerBanksByBanksIdList(new ArrayList<>(uniqueCustomerBankIdSet)));

        bankCombo.setItems(customerBankList);

        customerBankList.stream().findFirst().ifPresent(firstBank -> {
            bankCombo.setValue(firstBank);

            accountsList.stream().filter(account -> account.getBank().equals(firstBank)).findFirst().ifPresent(accountCombo::setValue);
        });

        Bank selectedBank = bankCombo.getValue();
        if (selectedBank != null) {
            ObservableList<CustomerAccount> customerBankAccounts = FXCollections.observableList(customerAccountService.getCustomerBankAccounts(selectedCustomer, selectedBank));
            accountCombo.setItems(customerBankAccounts);
            if (customerBankAccounts.size() == 1) {
                accountCombo.setValue(customerBankAccounts.get(0));
            } else {
                accountCombo.setValue(null);
            }
        }
    }


    public void fillDocumentInfoDataCombos() {

        currencyCombo.setItems(FXCollections.observableList(currencyService.getCurrencyList()));
        documentTypeCombo.setItems(FXCollections.observableList(documentTypeService.getDocumentTypeList()));
        documentTransactionTypeCombo.setItems(FXCollections.observableList(documentTransactionTypeService.getDocumentTransactionTypeList()));

        directionCombo.setItems(FXCollections.observableArrayList(DocumentDirection.values()));
        directionCombo.setCellFactory(new Callback<ListView<DocumentDirection>, ListCell<DocumentDirection>>() {
            @Override
            public ListCell<DocumentDirection> call(ListView<DocumentDirection> param) {
                return new ListCell<DocumentDirection>() {
                    @Override
                    protected void updateItem(DocumentDirection item, boolean empty) {
                        super.updateItem(item, empty);
                        if (item != null && !empty) {
                            setText(item.getDisplayName());
                        } else {
                            setText(null);
                        }
                    }
                };
            }
        });
        directionCombo.setButtonCell(new ListCell<DocumentDirection>() {
            @Override
            protected void updateItem(DocumentDirection item, boolean empty) {
                super.updateItem(item, empty);
                if (item != null && !empty) {
                    setText(item.getDisplayName());
                } else {
                    setText(null);
                }
            }
        });

    }

    private void setDefaultValues() {
        seriesField.setText(configService.get(BILL_SERIES_KEY));
        documentDateDp.setValue(LocalDate.now());
        accountingDateDp.setValue(LocalDate.now());
        paymentDateDp.setValue(LocalDate.now().plusDays(DEFAULT_PAY_DAY));
        Currency currencyDefault = currencyService.getDefaultCurrency();
        currencyCombo.setValue(currencyDefault);
        setExchangeRate(currencyDefault);

        sumTotalField.setText(DEFAULT_DOUBLE_FIELDS_TEXT);
        sumTotalInCurrencyField.setText(DEFAULT_DOUBLE_FIELDS_TEXT);
    }

    public void fillDocumentFormWithExistData(DocumentDto documentDto) {
        directionCombo.setValue(documentDto.getDocumentDirection());
        documentIdLabel.setText(documentDto.getId().toString());
        seriesField.setText(documentDto.getDocumentSeries());
        documentTypeCombo.setValue(documentDto.getDocumentType());
        documentTransactionTypeCombo.setValue(documentDto.getDocumentTransactionType());
        numberField.setText(String.valueOf(documentDto.getDocumentNumber()));
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

        if (publisherCombo.getValue() != null) {
            fetchAndSetBankAccountDetails(publisherCombo, publisherBankCombo, publisherBankAccountCombo);
        }

        if (receiverCombo.getValue() != null) {
            fetchAndSetBankAccountDetails(receiverCombo, receiverBankCombo, receiverBankAccountCombo);
        }

    }

    public void fetchAndSetBankAccountDetails(SearchableComboBox customerCombo, ComboBox bankCombo, ComboBox accountCombo) {
        ObservableList<CustomerAccount> accountsList = FXCollections.observableList(customerAccountService.getCustomerAccounts((Customer) customerCombo.getValue()));
        List<Integer> uniqueCustomerBankIdList = accountsList.stream().filter(getDistinctValues(CustomerAccount::getBank)).map(account -> account.getBank().getId()).distinct().toList();

        ObservableList<Bank> customerBankList = FXCollections.observableList(bankService.getCustomerBanksByBanksIdList(uniqueCustomerBankIdList));
        bankCombo.setItems(customerBankList);

        ObservableList<CustomerAccount> customerBankAccounts = FXCollections.observableList(customerAccountService.getCustomerBankAccounts((Customer) customerCombo.getValue(), (Bank) bankCombo.getValue()));
        accountCombo.setItems(customerBankAccounts);
    }

    public void currencyOnAction() {
        Currency selectedCurrency = currencyCombo.getValue();
        setExchangeRate(selectedCurrency);
    }

    private void setExchangeRate(Currency currency) {
        currencyExchangeRate = exchangeService.getActuallyExchangeRate(accountingDateDp.getValue(), currency);
        exchangeRateField.setText(currencyExchangeRate.getRate().toString());
    }

    public DocumentDto fillDocumentDto() {

        validateAndSetError(documentDateDp, DocumentDtoValidator::validateDateNotNull, DatePickerWithErrorLabel::getValue);
        validateAndSetError(accountingDateDp, DocumentDtoValidator::validateDateNotNull, DatePickerWithErrorLabel::getValue);

        validateEmptyDirectionAndSetError(directionCombo);
        validateEmptyDirectionAndSetError(documentTypeCombo);

        return DocumentDtoValidator.validateAndCreateDocumentDto(documentIdLabel.getText().isEmpty() ? null : Integer.parseInt(documentIdLabel.getText()), directionCombo.getValue(), numberField.getText(), seriesField.getText(), documentTypeCombo.getValue(), documentTransactionTypeCombo.getValue(), accountingDateDp.getValue(), documentDateDp.getValue(), paymentDateDp.getValue(), null, getDouble(sumTotalField.getText()), getDouble(sumTotalInCurrencyField.getText()), currencyCombo.getValue(), currencyExchangeRate, notesForCustomerField.getText(), internalNotesField.getText(), publisherCombo.getValue(), publisherBankCombo.getValue(), publisherBankAccountCombo.getValue(), receiverCombo.getValue(), receiverBankCombo.getValue(), receiverBankAccountCombo.getValue());
    }

    private <T> void validateEmptyDirectionAndSetError(ComboBoxWithErrorLabel<T> comboBox) {
        String errorMessage = DocumentDtoValidator.validateDateNotNull(comboBox.getValue());
        if (isNotEmpty(errorMessage)) {
            comboBox.setError(errorMessage);
            throw new IllegalDataArgumentException(errorMessage);
        }
    }

    private <T extends Validatable, U> void validateAndSetError(T field, Function<U, String> validationFunction, Function<T, U> valueExtractor) {
        U value = valueExtractor.apply(field);
        String errorMessage = validationFunction.apply(value);
        if (isNotEmpty(errorMessage)) {
            field.setError(errorMessage);
            throw new IllegalDataArgumentException(errorMessage);
        }
    }
}