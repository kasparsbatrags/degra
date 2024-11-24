package lv.degra.accounting.desktop.document.controller;

import static lv.degra.accounting.desktop.document.DocumentFieldsUtils.getDouble;
import static lv.degra.accounting.desktop.document.DocumentFieldsUtils.setFieldFormat;
import static lv.degra.accounting.desktop.system.configuration.DegraDesktopConfig.BILL_SERIES_KEY;
import static lv.degra.accounting.desktop.system.configuration.DegraDesktopConfig.DEFAULT_DOUBLE_FIELDS_TEXT;
import static lv.degra.accounting.desktop.system.configuration.DegraDesktopConfig.FIELD_REQUIRED_MESSAGE;
import static lv.degra.accounting.desktop.system.configuration.DegraDesktopConfig.SUM_FORMAT_REGEX;
import static lv.degra.accounting.desktop.system.configuration.DegraDesktopConfig.VALIDATION_TYPE_CUSTOM;
import static lv.degra.accounting.desktop.system.configuration.DegraDesktopConfig.VALIDATION_TYPE_REQUIRED;
import static org.apache.commons.lang3.StringUtils.EMPTY;
import static org.apache.commons.lang3.StringUtils.isBlank;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import javafx.beans.Observable;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.fxml.FXML;
import javafx.scene.control.Label;
import javafx.scene.layout.Pane;
import lombok.Getter;
import lv.degra.accounting.core.bank.model.Bank;
import lv.degra.accounting.core.bank.service.BankService;
import lv.degra.accounting.core.currency.model.Currency;
import lv.degra.accounting.core.currency.service.CurrencyService;
import lv.degra.accounting.core.customer.model.Customer;
import lv.degra.accounting.core.customer.service.CustomerService;
import lv.degra.accounting.core.customer_account.model.CustomerAccount;
import lv.degra.accounting.core.customer_account.service.CustomerAccountService;
import lv.degra.accounting.core.document.dto.DocumentDto;
import lv.degra.accounting.core.document.model.DocumentDirection;
import lv.degra.accounting.core.document.model.DocumentSubType;
import lv.degra.accounting.core.document.model.DocumentTransactionType;
import lv.degra.accounting.core.document.model.DocumentType;
import lv.degra.accounting.core.document.service.DocumentDirectionService;
import lv.degra.accounting.core.document.service.DocumentSubTypeService;
import lv.degra.accounting.core.document.service.DocumentTransactionTypeService;
import lv.degra.accounting.core.exchange.model.CurrencyExchangeRate;
import lv.degra.accounting.core.exchange.service.ExchangeService;
import lv.degra.accounting.core.system.configuration.service.ConfigService;
import lv.degra.accounting.desktop.system.component.DatePickerWithErrorLabel;
import lv.degra.accounting.desktop.system.component.TextFieldWithErrorLabel;
import lv.degra.accounting.desktop.system.component.lazycombo.ComboBoxWithErrorLabel;
import lv.degra.accounting.desktop.system.component.lazycombo.ControlWithErrorLabel;
import lv.degra.accounting.desktop.system.component.lazycombo.SearchableComboBoxWithErrorLabel;
import lv.degra.accounting.desktop.system.component.lazycombo.customer.CustomerStringConverter;
import lv.degra.accounting.desktop.validation.ValidationFunction;
import lv.degra.accounting.desktop.validation.service.ValidationService;

@Component
public class InfoController extends DocumentControllerComponent {

	private final CustomerAccountService customerAccountService;
	private final BankService bankService;
	private final ExchangeService exchangeService;
	private final ConfigService configService;
	private final CurrencyService currencyService;
	private final DocumentSubTypeService documentSubTypeService;
	private final DocumentTransactionTypeService documentTransactionTypeService;
	private final DocumentDirectionService documentDirectionService;
	private final CustomerService customerService;
	private final Map<String, ValidationFunction> infoValidationFunctions = new HashMap<>();
	private final List<ControlWithErrorLabel<?>> infoValidationControls = new ArrayList<>();
	@FXML
	public ComboBoxWithErrorLabel<DocumentTransactionType> documentTransactionTypeCombo;
	@FXML
	public SearchableComboBoxWithErrorLabel<Customer> publisherCombo;
	@FXML
	public ComboBoxWithErrorLabel<Bank> publisherBankCombo;
	@FXML
	public ComboBoxWithErrorLabel<CustomerAccount> publisherBankAccountCombo;
	@FXML
	public SearchableComboBoxWithErrorLabel<Customer> receiverCombo;
	@FXML
	public ComboBoxWithErrorLabel<Bank> receiverBankCombo;
	@FXML
	public ComboBoxWithErrorLabel<CustomerAccount> receiverBankAccountCombo;
	@FXML
	public ComboBoxWithErrorLabel<DocumentDirection> directionCombo;
	@FXML
	public ComboBoxWithErrorLabel<Currency> currencyCombo;
	@FXML
	public Label documentIdLabel;
	@FXML
	public TextFieldWithErrorLabel seriesField;
	@FXML
	public TextFieldWithErrorLabel numberField;
	@FXML
	@Getter
	public TextFieldWithErrorLabel sumTotalField;
	@FXML
	public TextFieldWithErrorLabel sumTotalInCurrencyField;
	@FXML
	public TextFieldWithErrorLabel exchangeRateField;
	@FXML
	public DatePickerWithErrorLabel accountingDateDp;
	@FXML
	public DatePickerWithErrorLabel documentDateDp;
	@FXML
	public DatePickerWithErrorLabel paymentDateDp;
	@FXML
	public ComboBoxWithErrorLabel<DocumentSubType> documentSubTypeCombo;
	@FXML
	public Pane publisherPane;
	@FXML
	public Pane receiverPane;
	@FXML
	public Pane paymentPane;
	private CurrencyExchangeRate currencyExchangeRate;

	public InfoController(Mediator mediator, CustomerAccountService customerAccountService, BankService bankService,
			ExchangeService exchangeService, ConfigService configService, CurrencyService currencyService,
			DocumentSubTypeService documentSubTypeService, DocumentTransactionTypeService documentTransactionTypeService,
			DocumentDirectionService documentDirectionService, CustomerService customerService, ValidationService validationService) {
		super(mediator, validationService);
		this.configService = configService;
		this.currencyService = currencyService;
		this.documentSubTypeService = documentSubTypeService;
		this.documentTransactionTypeService = documentTransactionTypeService;
		this.documentDirectionService = documentDirectionService;
		this.customerService = customerService;

		this.customerAccountService = customerAccountService;
		this.bankService = bankService;
		this.exchangeService = exchangeService;
	}

	public static <T> Predicate<T> getDistinctValues(Function<? super T, ?> keyExtractor) {
		Set<Object> seen = ConcurrentHashMap.newKeySet();
		return t -> seen.add(keyExtractor.apply(t));
	}

	@FXML
	public void publisherOnAction() {
		setBankInfo(publisherCombo, publisherBankCombo, publisherBankAccountCombo);
	}

	@FXML
	public void publisherBankOnAction() {
		setCustomerAccountInfo(publisherCombo, publisherBankCombo, publisherBankAccountCombo);
	}

	@FXML
	public void sumTotalOnAction() {
		sumTotalInCurrencyField.setText(calculateCurrencyTotal(sumTotalField.getText(), exchangeRateField.getText()));
	}

	@FXML
	public void currencyOnAction() {
		Currency selectedCurrency = currencyCombo.getValue();
		setExchangeRate(selectedCurrency);
	}

	@FXML
	public void documentSubTypeComboOnAction() {
		mediator.updateDocumentTabs();
		refreshScreenControlsByDocumentSubType();
		setControllerObjectsValidationRulesByDocumentSubtype(getDocumentSubTypeId());
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
	public void initialize() {
		infoValidationControls.clear();
		infoValidationFunctions.put(VALIDATION_TYPE_REQUIRED, this::applyRequiredValidation);
		infoValidationFunctions.put(VALIDATION_TYPE_CUSTOM, this::applyCustomValidation);
		setDefaultValues();

		sumTotalField.focusedProperty().addListener(this::handleSumTotalFocusChange);

		exchangeRateField.focusedProperty().addListener((observable, oldValue, newValue) -> {
			if (Boolean.FALSE.equals(newValue)) {
				sumTotalOnAction();
			}
		});

		fillDocumentInfoDataCombos();
		setFieldFormat(sumTotalField.getTextField(), SUM_FORMAT_REGEX);
		setFieldFormat(sumTotalInCurrencyField.getTextField(), SUM_FORMAT_REGEX);

		publisherCombo.setDataFetchService(customerService);
		publisherCombo.setConverter(new CustomerStringConverter(customerService));
		receiverCombo.setDataFetchService(customerService);
		receiverCombo.setConverter(new CustomerStringConverter(customerService));
		addValidationControl(documentSubTypeCombo, Objects::nonNull, FIELD_REQUIRED_MESSAGE);
	}

	@Override
	public <T> void addValidationControl(ControlWithErrorLabel<T> control, Predicate<T> validationCondition, String errorMessage) {
		control.setValidationCondition(validationCondition, errorMessage);
		infoValidationControls.add(control);
	}

	@Override
	public void clearValidationControls() {
		infoValidationControls.clear();
	}

	@Override
	public boolean validate() {
		return validateControllerControls(infoValidationControls);
	}

	@Override
	public void getData(DocumentDto documentDto) {
		documentDto.setDocumentTransactionType(documentTransactionTypeCombo.getValue());
		documentDto.setPublisherCustomer(publisherCombo.getValue());
		documentDto.setPublisherCustomerBank(publisherBankCombo.getValue());
		documentDto.setPublisherCustomerBankAccount(publisherBankAccountCombo.getValue());
		documentDto.setReceiverCustomer(receiverCombo.getValue());
		documentDto.setReceiverCustomerBank(receiverBankCombo.getValue());
		documentDto.setReceiverCustomerBankAccount(receiverBankAccountCombo.getValue());
		documentDto.setDocumentDirection(directionCombo.getValue());
		documentDto.setCurrency(currencyCombo.getValue());
		documentDto.setDocumentSeries(seriesField.getText());
		documentDto.setDocumentNumber(numberField.getText());
		documentDto.setSumTotal(getDouble(sumTotalField.getText()));
		documentDto.setSumTotalInCurrency(getDouble(sumTotalInCurrencyField.getText()));
		documentDto.setExchangeRate(currencyExchangeRate);
		documentDto.setAccountingDate(accountingDateDp.getValue());
		documentDto.setDocumentDate(documentDateDp.getValue());
		documentDto.setPaymentDate(paymentDateDp.getValue());
		documentDto.setDocumentSubType(documentSubTypeCombo.getValue());
	}

	@Override
	public void setData(DocumentDto documentDto) {
		directionCombo.setValue(documentDto.getDocumentDirection());
		seriesField.setText(documentDto.getDocumentSeries());
		documentSubTypeCombo.setValue(documentDto.getDocumentSubType());
		documentTransactionTypeCombo.setValue(documentDto.getDocumentTransactionType());
		numberField.setText(!isBlank(documentDto.getDocumentNumber()) ? documentDto.getDocumentNumber() : EMPTY);
		accountingDateDp.setValue(documentDto.getAccountingDate());
		documentDateDp.setValue(documentDto.getDocumentDate());
		paymentDateDp.setValue(documentDto.getPaymentDate());
		sumTotalField.setText(documentDto.getSumTotal().toString());
		sumTotalInCurrencyField.setText(documentDto.getSumTotalInCurrency().toString());
		exchangeRateField.setText(documentDto.getExchangeRate().getRate().toString());
		currencyCombo.setValue(documentDto.getCurrency());
		publisherCombo.setValue(documentDto.getPublisherCustomer());
		publisherBankCombo.setValue(documentDto.getPublisherCustomerBank());
		publisherBankAccountCombo.setValue(documentDto.getPublisherCustomerBankAccount());
		receiverCombo.setValue(documentDto.getReceiverCustomer());
		receiverBankCombo.setValue(documentDto.getReceiverCustomerBank());
		receiverBankAccountCombo.setValue(documentDto.getReceiverCustomerBankAccount());
		currencyExchangeRate = documentDto.getExchangeRate();

		if (publisherCombo.getValue() != null) {
			fetchAndSetBankAccountDetails(publisherCombo, publisherBankCombo, publisherBankAccountCombo);
		}

		if (receiverCombo.getValue() != null) {
			fetchAndSetBankAccountDetails(receiverCombo, receiverBankCombo, receiverBankAccountCombo);
		}
	}

	private void setExchangeRate(Currency currency) {
		currencyExchangeRate = exchangeService.getActuallyExchangeRate(accountingDateDp.getValue(), currency);
		exchangeRateField.setText(currencyExchangeRate.getRate().toString());
	}

	private String calculateCurrencyTotal(String sum, String rate) {
		double total = getDouble(sum) * getDouble(rate);
		return String.valueOf(total);
	}

	public void setCustomerAccountInfo(SearchableComboBoxWithErrorLabel<Customer> customerCombo, ComboBoxWithErrorLabel<Bank> bankCombo,
			ComboBoxWithErrorLabel<CustomerAccount> accountCombo) {
		Customer selectedCustomer = customerCombo.getValue();
		Bank selectedBank = bankCombo.getValue();
		if (selectedBank != null) {
			ObservableList<CustomerAccount> customerBankAccounts = FXCollections.observableList(
					FXCollections.observableList(customerAccountService.getCustomerBankAccounts(selectedCustomer, selectedBank)));
			if (customerBankAccounts.size() == 1) {
				CustomerAccount account = customerBankAccounts.getFirst();
				accountCombo.setItems(customerBankAccounts);
				accountCombo.setValue(account);
			} else {
				accountCombo.setItems(customerBankAccounts);
				if (customerBankAccounts.size() == 1) {
					accountCombo.setValue(customerBankAccounts.getFirst());
				} else {
					accountCombo.setValue(null);
				}
			}
		}
	}

	public void setBankInfo(SearchableComboBoxWithErrorLabel<Customer> customerCombo, ComboBoxWithErrorLabel<Bank> bankCombo,
			ComboBoxWithErrorLabel<CustomerAccount> accountCombo) {
		Customer selectedCustomer = customerCombo.getValue();
		if (selectedCustomer == null) {
			return;
		}

		List<CustomerAccount> accountsList = customerAccountService.getCustomerAccounts(selectedCustomer);
		Set<Integer> uniqueCustomerBankIdSet = accountsList.stream().map(account -> account.getBank().getId()).collect(Collectors.toSet());

		ObservableList<Bank> customerBankList = FXCollections.observableList(
				bankService.getCustomerBanksByBanksIdList(new ArrayList<>(uniqueCustomerBankIdSet)));

		bankCombo.setItems(customerBankList);

		customerBankList.stream().findFirst().ifPresent(firstBank -> {
			bankCombo.setValue(firstBank);

			accountsList.stream().filter(account -> account.getBank().equals(firstBank)).findFirst().ifPresent(accountCombo::setValue);
		});

		Bank selectedBank = bankCombo.getValue();
		if (selectedBank != null) {
			ObservableList<CustomerAccount> customerBankAccounts = FXCollections.observableList(
					FXCollections.observableList(customerAccountService.getCustomerBankAccounts(selectedCustomer, selectedBank)));
			accountCombo.setItems(customerBankAccounts);
			if (customerBankAccounts.size() == 1) {
				accountCombo.setValue(customerBankAccounts.getFirst());
			} else {
				accountCombo.setValue(null);
				accountCombo.setItems(FXCollections.observableArrayList());
			}
		}
	}

	public void fetchAndSetBankAccountDetails(SearchableComboBoxWithErrorLabel<Customer> customerCombo,
			ComboBoxWithErrorLabel<Bank> bankCombo, ComboBoxWithErrorLabel<CustomerAccount> accountCombo) {
		ObservableList<CustomerAccount> accountsList = FXCollections.observableList(
				customerAccountService.getCustomerAccounts(customerCombo.getValue()));
		List<Integer> uniqueCustomerBankIdList = accountsList.stream().filter(getDistinctValues(CustomerAccount::getBank))
				.map(account -> account.getBank().getId()).distinct().toList();

		ObservableList<Bank> customerBankList = FXCollections.observableList(
				bankService.getCustomerBanksByBanksIdList(uniqueCustomerBankIdList));
		bankCombo.setItems(customerBankList);

		ObservableList<CustomerAccount> customerBankAccounts = FXCollections.observableList(FXCollections.observableList(
				customerAccountService.getCustomerBankAccounts(customerCombo.getValue(), bankCombo.getValue())));
		accountCombo.setItems(customerBankAccounts);
	}

	public void refreshScreenControlsByDocumentSubType() {
		refreshScreenControls(getDocumentSubTypeId());

	}

	protected Integer getDocumentSubTypeId() {
		Optional<DocumentSubType> optionalDocumentSubType = Optional.ofNullable(documentSubTypeCombo.getValue());

		optionalDocumentSubType.map(DocumentSubType::getDocumentType).map(DocumentType::getCode)
				.ifPresentOrElse(code -> documentTransactionTypeCombo.setDisable(!"BILL".equals(code)),
						() -> documentTransactionTypeCombo.setDisable(true));

		optionalDocumentSubType.map(DocumentSubType::getDirection)
				.ifPresentOrElse(directionCombo::setValue, () -> directionCombo.setValue(null));

		return optionalDocumentSubType.map(DocumentSubType::getId).orElse(null);

	}

	private void setDefaultValues() {
		seriesField.setText(configService.get(BILL_SERIES_KEY));
		documentDateDp.setValue(LocalDate.now());
		accountingDateDp.setValue(LocalDate.now());
		Currency currencyDefault = currencyService.getDefaultCurrency();
		currencyCombo.setValue(currencyDefault);
		setExchangeRate(currencyDefault);
		sumTotalField.setText(DEFAULT_DOUBLE_FIELDS_TEXT);
		sumTotalInCurrencyField.setText(DEFAULT_DOUBLE_FIELDS_TEXT);
	}

	private void handleSumTotalFocusChange(Observable observable, boolean oldValue, boolean newValue) {
		if (!newValue) {
			sumTotalOnAction();
		}
	}

	public void fillDocumentInfoDataCombos() {

		currencyCombo.setItems(FXCollections.observableList(currencyService.getCurrencyList()));
		documentSubTypeCombo.setItems(FXCollections.observableList(documentSubTypeService.getDocumentSubTypeList()));
		documentTransactionTypeCombo.setItems(
				FXCollections.observableList(documentTransactionTypeService.getDocumentTransactionTypeList()));

		directionCombo.setItems(FXCollections.observableArrayList(documentDirectionService.getDocumentDirectionList()));

	}

	protected void setControllerObjectsValidationRulesByDocumentSubtype(int documentSubTypeId) {
		validationService.applyValidationRulesByDocumentSubType(this, documentSubTypeId);
	}

	public <T> void removeValidationControlByMessage(ControlWithErrorLabel<T> control, String errorMessage) {
		control.removeValidationCondition(errorMessage);
		infoValidationControls.remove(control);
	}
}
