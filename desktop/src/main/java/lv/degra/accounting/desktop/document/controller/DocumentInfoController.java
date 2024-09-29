package lv.degra.accounting.desktop.document.controller;

import static lv.degra.accounting.desktop.document.DocumentFieldsUtils.getDouble;
import static lv.degra.accounting.desktop.document.DocumentFieldsUtils.setFieldFormat;
import static lv.degra.accounting.desktop.system.configuration.DegraDesktopConfig.BILL_SERIES_KEY;
import static lv.degra.accounting.desktop.system.configuration.DegraDesktopConfig.FIELD_REQUIRED_MESSAGE;
import static lv.degra.accounting.desktop.system.configuration.DegraDesktopConfig.SUM_FORMAT_REGEX;
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

import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.stereotype.Component;

import javafx.beans.Observable;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.fxml.FXML;
import javafx.scene.Node;
import javafx.scene.Scene;
import javafx.scene.control.Label;
import javafx.scene.layout.Pane;
import lombok.Getter;
import lombok.Setter;
import lv.degra.accounting.core.account.chart.service.AccountCodeChartService;
import lv.degra.accounting.core.account.distribution.dto.AccountCodeDistributionDto;
import lv.degra.accounting.core.account.distribution.service.AccountCodeDistributionService;
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
import lv.degra.accounting.core.validation.model.ValidationRule;
import lv.degra.accounting.desktop.system.component.ComboBoxWithErrorLabel;
import lv.degra.accounting.desktop.system.component.ControlWithErrorLabel;
import lv.degra.accounting.desktop.system.component.DatePickerWithErrorLabel;
import lv.degra.accounting.desktop.system.component.DynamicTableView;
import lv.degra.accounting.desktop.system.component.TextFieldWithErrorLabel;
import lv.degra.accounting.desktop.system.component.lazycombo.SearchableComboBox;
import lv.degra.accounting.desktop.system.utils.DegraController;
import lv.degra.accounting.desktop.validation.ValidationFunction;
import lv.degra.accounting.desktop.validation.service.ValidationService;

@Component
@Getter
public class DocumentInfoController extends DegraController {

	private static final String DEFAULT_DOUBLE_FIELDS_TEXT = "0";
	private static final String BILL_CODE = "BILL";
	private static final String VALIDATION_TYPE_REQUIRED = "required";
	private static final String VALIDATION_TYPE_CUSTOM = "custom";
	private final CurrencyService currencyService;
	private final DocumentSubTypeService documentSubTypeService;
	private final DocumentDirectionService documentDirectionService;
	private final DocumentTransactionTypeService documentTransactionTypeService;
	private final ExchangeService exchangeService;
	private final CustomerService customerService;
	private final BankService bankService;
	private final CustomerAccountService customerAccountService;
	private final ConfigService configService;
	private final ValidationService validationService;
	private final ConfigurableApplicationContext springContext;
	private final AccountCodeChartService accountCodeChartService;
	private final AccountCodeDistributionService accountCodeDistributionService;
	private final BillController billController;
	@FXML
	public ComboBoxWithErrorLabel<DocumentTransactionType> documentTransactionTypeCombo;
	@FXML
	public SearchableComboBox<Customer> publisherCombo;
	@FXML
	public ComboBoxWithErrorLabel<Bank> publisherBankCombo;
	@FXML
	public ComboBoxWithErrorLabel<CustomerAccount> publisherBankAccountCombo;
	@FXML
	public SearchableComboBox<Customer> receiverCombo;
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
	@Setter
	public Map<String, ValidationFunction> validationFunctions = new HashMap<>();
	@FXML
	public Pane publisherPane;
	@FXML
	public Pane receiverPane;
	@FXML
	public Pane paymentPane;
	@FXML
	private DynamicTableView<AccountCodeDistributionDto> distributionListView = new DynamicTableView<>();
	private DocumentMainController documentMainController;
	private DocumentAdditionalInfoController documentAdditionalInfoController;
	private CurrencyExchangeRate currencyExchangeRate;

	public DocumentInfoController(CurrencyService currencyService, DocumentSubTypeService documentSubTypeService,
			DocumentDirectionService documentDirectionService, DocumentTransactionTypeService documentTransactionTypeService,
			ExchangeService exchangeService, CustomerService customerService, BankService bankService,
			CustomerAccountService customerAccountService, ConfigService configService, ValidationService validationService,
			ConfigurableApplicationContext springContext, AccountCodeChartService accountCodeChartService,
			AccountCodeDistributionService accountCodeDistributionService,
			BillController billController) {
		this.currencyService = currencyService;
		this.documentSubTypeService = documentSubTypeService;
		this.documentDirectionService = documentDirectionService;
		this.documentTransactionTypeService = documentTransactionTypeService;
		this.exchangeService = exchangeService;
		this.customerService = customerService;
		this.bankService = bankService;
		this.customerAccountService = customerAccountService;
		this.configService = configService;
		this.validationService = validationService;
		this.springContext = springContext;
		this.accountCodeChartService = accountCodeChartService;
		this.accountCodeDistributionService = accountCodeDistributionService;
		this.billController = billController;
	}

	public static <T> Predicate<T> getDistinctValues(Function<? super T, ?> keyExtractor) {
		Set<Object> seen = ConcurrentHashMap.newKeySet();
		return t -> seen.add(keyExtractor.apply(t));
	}

	private void handleSumTotalFocusChange(Observable observable, boolean oldValue, boolean newValue) {
		if (!newValue) {
			sumTotalOnAction();
		}
	}

	@FXML
	public void initialize() {
		validationFunctions.put(VALIDATION_TYPE_REQUIRED, this::applyRequiredValidation);
		validationFunctions.put(VALIDATION_TYPE_CUSTOM, this::applyCustomValidation);

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

		publisherCombo.setCustomerService(customerService);
		receiverCombo.setCustomerService(customerService);
		addValidationControl(documentSubTypeCombo, Objects::nonNull, FIELD_REQUIRED_MESSAGE);

		distributionListView.setType(AccountCodeDistributionDto.class);
		distributionListView.setCreator(item -> {
			addRecord();
			refreshDistributionTable();
		});
		distributionListView.setUpdater(item -> editRecord());
		distributionListView.setDeleter(item -> {
			deleteRecord();
			refreshDistributionTable();
		});
	}

	private void refreshDistributionTable() {
		ObservableList<AccountCodeDistributionDto> accountCodeDistributionDtoObservableList = FXCollections.observableArrayList();
		accountCodeDistributionDtoObservableList.clear();
		accountCodeDistributionDtoObservableList.addAll(
				accountCodeDistributionService.getDistributionByDocumentId(this.documentMainController.getDocumentDto().getId()));
		distributionListView.setData(accountCodeDistributionDtoObservableList);
	}

	protected void setDocumentInfoValidationRules() {
		if (documentSubTypeCombo == null || documentSubTypeCombo.getValue() == null) {
			return;
		}
		int documentSubTypeId = documentSubTypeCombo.getValue().getId();
		validationService.applyValidationRulesByDocumentSubType(this, documentSubTypeId, DocumentAdditionalInfoController.class);
	}

	protected void applyRequiredValidation(ValidationRule validationRule) {
		validationService.applyRequiredValidation(validationRule, this);
	}

	protected void applyCustomValidation(ValidationRule validationRule) {
		validationService.applyCustomValidation(validationRule, this);
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

	@FXML
	public void documentSubTypeComboOnAction() {
		this.documentMainController.actualizeDocumentTabs();
		setDocumentInfoValidationRules();
		refreshScreenControls();

	}

	public void refreshScreenControls() {
		Optional<DocumentSubType> optionalDocumentSubType = Optional.ofNullable(documentSubTypeCombo.getValue());

		optionalDocumentSubType.map(DocumentSubType::getDocumentType).map(DocumentType::getCode)
				.ifPresentOrElse(code -> documentTransactionTypeCombo.setDisable(!"BILL".equals(code)),
						() -> documentTransactionTypeCombo.setDisable(true));

		optionalDocumentSubType.map(DocumentSubType::getDirection)
				.ifPresentOrElse(directionCombo::setValue, () -> directionCombo.setValue(null));

		Integer documentSubtypeId = optionalDocumentSubType.map(DocumentSubType::getId).orElse(null);

		List<ValidationRule> validationRuleList = validationService.getValidationRulesByDocumentSybType(documentSubtypeId);

		validationRuleList.forEach(rule -> {
			Object field = getControllerFieldByName(rule.getValidationObject().getName());
			if (field instanceof ControlWithErrorLabel<?> control) {
				control.setVisible(rule.isShowInForm());
				control.setDisable(rule.isDefaultDisabled());
			} else if (field instanceof Node node) {
				node.setVisible(rule.isShowInForm());
				node.setDisable(rule.isDefaultDisabled());
			} else {
				throw new IllegalArgumentException("Unsupported field type: " + field.getClass().getName());
			}
		});
	}

	public Object getControllerFieldByName(String name) {
		Object field = validationService.getFieldByName(this, name, DocumentInfoController.class);
		if (field == null) {
			field = validationService.getFieldByName(documentAdditionalInfoController, name, DocumentAdditionalInfoController.class);
		}
		if (field == null) {
			field = validationService.getFieldByName(billController, name, BillController.class);
		}

		return field;

	}

	public void injectMainController(DocumentMainController documentMainController) {
		this.documentMainController = documentMainController;
	}

	public void injectAdditionalInfoController(DocumentAdditionalInfoController documentAdditionalInfoController) {
		this.documentAdditionalInfoController = documentAdditionalInfoController;
	}

	public boolean isDocumentBill() {
		return Optional.ofNullable(documentSubTypeCombo).map(ComboBoxWithErrorLabel::getValue).map(DocumentSubType::getCode)
				.map(BILL_CODE::equals).orElse(false);
	}

	public void setCustomerAccountInfo(SearchableComboBox<Customer> customerCombo, ComboBoxWithErrorLabel<Bank> bankCombo,
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

	public void setBankInfo(SearchableComboBox<Customer> customerCombo, ComboBoxWithErrorLabel<Bank> bankCombo,
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

	public void fillDocumentInfoDataCombos() {

		currencyCombo.setItems(FXCollections.observableList(currencyService.getCurrencyList()));
		documentSubTypeCombo.setItems(FXCollections.observableList(documentSubTypeService.getDocumentSubTypeList()));
		documentTransactionTypeCombo.setItems(
				FXCollections.observableList(documentTransactionTypeService.getDocumentTransactionTypeList()));

		directionCombo.setItems(FXCollections.observableArrayList(documentDirectionService.getDocumentDirectionList()));

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

	public void fillDocumentFormWithExistData(DocumentDto documentDto) {
		directionCombo.setValue(documentDto.getDocumentDirection());
		documentIdLabel.setText(documentDto.getId() != null ? documentDto.getId().toString() : EMPTY);
		seriesField.setText(documentDto.getDocumentSeries());
		documentSubTypeCombo.setValue(documentDto.getDocumentSubType());
		documentTransactionTypeCombo.setValue(documentDto.getDocumentTransactionType());
		numberField.setText(!isBlank(documentDto.getDocumentNumber()) ? documentDto.getDocumentNumber() : EMPTY);
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
		documentAdditionalInfoController.notesForCustomerField.setText(documentDto.getNotesForCustomer());
		documentAdditionalInfoController.internalNotesField.setText(documentDto.getInternalNotes());
		currencyExchangeRate = documentDto.getCurrencyExchangeRate();

		if (publisherCombo.getValue() != null) {
			fetchAndSetBankAccountDetails(publisherCombo, publisherBankCombo, publisherBankAccountCombo);
		}

		if (receiverCombo.getValue() != null) {
			fetchAndSetBankAccountDetails(receiverCombo, receiverBankCombo, receiverBankAccountCombo);
		}
		refreshDistributionTable();
		setDocumentInfoValidationRules();
	}

	public void fetchAndSetBankAccountDetails(SearchableComboBox<Customer> customerCombo, ComboBoxWithErrorLabel<Bank> bankCombo,
			ComboBoxWithErrorLabel<CustomerAccount> accountCombo) {
		ObservableList<CustomerAccount> accountsList = FXCollections.observableList(
				customerAccountService.getCustomerAccounts(customerCombo.getValue()));
		List<Integer> uniqueCustomerBankIdList = accountsList.stream().filter(getDistinctValues(CustomerAccount::getBank))
				.map(account -> account.getBank().getId()).distinct().toList();

		ObservableList<Bank> customerBankList = FXCollections.observableList(
				bankService.getCustomerBanksByBanksIdList(uniqueCustomerBankIdList));
		bankCombo.setItems(customerBankList);

		ObservableList<CustomerAccount> customerBankAccounts = FXCollections.observableList(
				FXCollections.observableList(
						customerAccountService.getCustomerBankAccounts(customerCombo.getValue(), bankCombo.getValue())));
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

		return new DocumentDto(documentIdLabel.getText().isEmpty() ? null : Integer.parseInt(documentIdLabel.getText()),
				directionCombo.getValue(), numberField.getText(), seriesField.getText(), documentSubTypeCombo.getValue(),
				documentTransactionTypeCombo.getValue(), accountingDateDp.getValue(), documentDateDp.getValue(), paymentDateDp.getValue(),
				null, getDouble(sumTotalField.getText()), getDouble(sumTotalInCurrencyField.getText()), currencyCombo.getValue(),
				currencyExchangeRate, documentAdditionalInfoController.notesForCustomerField.getText(),
				documentAdditionalInfoController.internalNotesField.getText(), publisherCombo.getValue(),
				publisherBankCombo.getValue(), publisherBankAccountCombo.getValue(), receiverCombo.getValue(), receiverBankCombo.getValue(),
				receiverBankAccountCombo.getValue());
	}

	public boolean isDocumentInfoChanged() {
		documentMainController.setDocument(fillDocumentDto());
		return !documentMainController.getDocumentDto().equals(documentMainController.getDocumentDtoOld());
	}

	public Scene getScene() {
		return documentIdLabel.getScene();
	}

	public void onAddAccountingRowButton() {
	}
}