package lv.degra.accounting.document.controller;

import static lv.degra.accounting.configuration.DegraConfig.APPLICATION_TITLE;
import static lv.degra.accounting.configuration.DegraConfig.DEFAULT_PAY_DAY;
import static lv.degra.accounting.configuration.DegraConfig.SUM_FORMAT_REGEX;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.function.UnaryOperator;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;

import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.scene.control.Alert;
import javafx.scene.control.Button;
import javafx.scene.control.ComboBox;
import javafx.scene.control.Label;
import javafx.scene.control.ListCell;
import javafx.scene.control.ListView;
import javafx.scene.control.TextArea;
import javafx.scene.control.TextField;
import javafx.scene.control.TextFormatter;
import javafx.util.Callback;
import lv.degra.accounting.bank.model.Bank;
import lv.degra.accounting.bank.service.BankService;
import lv.degra.accounting.currency.model.Currency;
import lv.degra.accounting.currency.service.CurrencyService;
import lv.degra.accounting.customer.model.Customer;
import lv.degra.accounting.customer.service.CustomerService;
import lv.degra.accounting.customerAccount.model.CustomerBankAccount;
import lv.degra.accounting.customerAccount.service.CustomerAccountService;
import lv.degra.accounting.document.dto.DocumentDto;
import lv.degra.accounting.document.enums.DocumentDirection;
import lv.degra.accounting.document.model.Document;
import lv.degra.accounting.document.model.DocumentTransactionType;
import lv.degra.accounting.document.model.DocumentType;
import lv.degra.accounting.document.service.DocumentService;
import lv.degra.accounting.document.service.DocumentTransactionTypeService;
import lv.degra.accounting.document.service.DocumentTypeService;
import lv.degra.accounting.exchange.model.CurrencyExchangeRate;
import lv.degra.accounting.exchange.service.ExchangeService;
import lv.degra.accounting.system.exception.IncorrectSumException;
import lv.degra.accounting.system.object.DatePicker;
import lv.degra.accounting.system.utils.DegraController;

@Controller
public class DocumentController extends DegraController {

	public static final String EXCEPTION_TEXT_INCORRECT_SUM = "Nekorekta summa!";
	private static final String DEFAULT_DOUBLE_FIELDS_TEXT = "0";
	@FXML
	public ComboBox documentTypeCombo;
	@FXML
	public ComboBox documentTransactionTypeCombo;
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
	public ComboBox directionCombo;
	@FXML
	public ComboBox currencyCombo;
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
	public DatePicker accountingDateDp;
	@FXML
	public DatePicker documentDateDp;
	@FXML
	public DatePicker paymentDateDp;
	@FXML
	public TextArea notesForCustomerField;
	@FXML
	public TextArea internalNotesField;
	@FXML
	public Button saveButton;
	@Autowired
	private DocumentService documentService;
	@Autowired
	private CurrencyService currencyService;
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
	private CurrencyExchangeRate currencyExchangeRate;
	private DocumentDto documentDto;
	private ObservableList<Document> documentObservableList;

	public static <T> Predicate<T> getDistinctValues(Function<? super T, ?> keyExtractor) {
		Set<Object> seen = ConcurrentHashMap.newKeySet();
		return t -> seen.add(keyExtractor.apply(t));
	}

	@FXML
	public void onSaveButton(ActionEvent actionEvent) {
		try {
			Integer id = documentIdLabel.getText().isEmpty() ? null : Integer.parseInt(documentIdLabel.getText());
			documentDto = new DocumentDto(id,
					(DocumentDirection) directionCombo.getValue(),
					Integer.parseInt(numberField.getText()),
					seriesField.getText(),
					(DocumentType) documentTypeCombo.getValue(),
					(DocumentTransactionType) documentTransactionTypeCombo.getValue(),
					accountingDateDp.getValue(),
					documentDateDp.getValue(),
					paymentDateDp.getValue(),
					null,
					getDouble(sumTotalField.getText()),
					getDouble(sumTotalInCurrencyField.getText()),
					(Currency) currencyCombo.getValue(),
					currencyExchangeRate,
					notesForCustomerField.getText(),
					internalNotesField.getText(),
					(Customer) publisherCombo.getValue(),
					(Bank) publisherBankCombo.getValue(),
					(CustomerBankAccount) publisherBankAccountCombo.getValue(),
					(Customer) receiverCombo.getValue(),
					(Bank) receiverBankCombo.getValue(),
					(CustomerBankAccount) receiverBankAccountCombo.getValue()
			);
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

		sumTotalField.focusedProperty().addListener((observable, oldValue, newValue) -> {
			if (!newValue) {
				sumTotalOnAction();
			}
		});

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
				saveButton.requestFocus();
			}
		});

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

		sumTotalField.setText(DEFAULT_DOUBLE_FIELDS_TEXT);
		sumTotalInCurrencyField.setText(DEFAULT_DOUBLE_FIELDS_TEXT);
	}

	private void fillFormWithExistData(DocumentDto documentDto) {
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
	}

	private void setFormat() {
		setFieldFormat(sumTotalField, SUM_FORMAT_REGEX);
		setFieldFormat(sumTotalInCurrencyField, SUM_FORMAT_REGEX);
	}

	void setFieldFormat(TextField field, String sumRegex) {
		Pattern pattern = Pattern.compile(sumRegex);
		TextFormatter sumTotalDoubleFormatter = new TextFormatter(
				(UnaryOperator<TextFormatter.Change>) change -> pattern.matcher(change.getControlNewText()).matches() ? change : null);
		field.setTextFormatter(sumTotalDoubleFormatter);
	}

	private void fillCombos() {

		currencyCombo.setItems(FXCollections.observableList(currencyService.getCurrencyList()));
		documentTypeCombo.setItems(FXCollections.observableList(documentTypeService.getDocumentTypeList()));
		documentTransactionTypeCombo.setItems(
				FXCollections.observableList(documentTransactionTypeService.getDocumentTransactionTypeList()));
		ObservableList<Customer> customerList = FXCollections.observableList(customerService.getCustomerList());
		publisherCombo.setItems(customerList);
		receiverCombo.setItems(customerList);

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

	Double getDouble(String totalSum) {
		double result;
		try {
			result = Double.parseDouble(totalSum);
		} catch (RuntimeException e) {
			throw new IncorrectSumException(EXCEPTION_TEXT_INCORRECT_SUM);
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
		List<Integer> uniqueCustomerBankIdList = observableAccountsListBank.stream().filter(getDistinctValues(CustomerBankAccount::getBank))
				.map(account -> account.getBank().getId()).toList();

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

	private void setCustomerAccountInfo(ComboBox customerCombo, ComboBox bankCombo, ComboBox accountCombo) {
		Customer selectedCustomer = (Customer) customerCombo.getValue();
		Bank selectedBank = (Bank) bankCombo.getValue();
		if (selectedBank != null) {
			ObservableList<CustomerBankAccount> customerBankAccounts = customerAccountService.getCustomerBankAccounts(selectedCustomer,
					selectedBank);
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

	public void receiverBankOnAction() {
		setCustomerAccountInfo(receiverCombo, receiverBankCombo, receiverBankAccountCombo);
	}

	public void publisherOnAction() {
		setBankInfo(publisherCombo, publisherBankCombo, publisherBankAccountCombo);
	}

	public void publisherBankOnAction() {
		setCustomerAccountInfo(publisherCombo, publisherBankCombo, publisherBankAccountCombo);
	}

	public void sumTotalOnAction() {
		String sumTotalInCurrency = String.valueOf(getDouble(sumTotalField.getText()) * getDouble(exchangeRateField.getText()));
		sumTotalInCurrencyField.setText(sumTotalInCurrency);
	}
}
