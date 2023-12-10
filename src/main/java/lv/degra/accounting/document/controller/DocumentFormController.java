package lv.degra.accounting.document.controller;

import static lv.degra.accounting.configuration.DegraConfig.APPLICATION_TITLE;
import static lv.degra.accounting.configuration.DegraConfig.BILL_SERIES_KEY;
import static lv.degra.accounting.configuration.DegraConfig.DEFAULT_PAY_DAY;
import static lv.degra.accounting.configuration.DegraConfig.SUM_FORMAT_REGEX;
import static lv.degra.accounting.configuration.DegraConfig.VAT_PERCENTS;
import static lv.degra.accounting.document.controller.DocumentFieldsUtils.fillCombo;
import static lv.degra.accounting.document.controller.DocumentFieldsUtils.getDouble;
import static lv.degra.accounting.document.controller.DocumentFieldsUtils.setFieldFormat;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Function;
import java.util.function.Predicate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Controller;

import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.fxml.FXML;
import javafx.scene.control.Alert;
import javafx.scene.control.Button;
import javafx.scene.control.ComboBox;
import javafx.scene.control.Label;
import javafx.scene.control.ListCell;
import javafx.scene.control.ListView;
import javafx.scene.control.Tab;
import javafx.scene.control.TabPane;
import javafx.scene.control.TextArea;
import javafx.scene.control.TextField;
import javafx.scene.input.KeyCode;
import javafx.scene.input.KeyEvent;
import javafx.util.Callback;
import lv.degra.accounting.bank.model.Bank;
import lv.degra.accounting.bank.service.BankService;
import lv.degra.accounting.currency.model.Currency;
import lv.degra.accounting.currency.service.CurrencyService;
import lv.degra.accounting.customer.model.Customer;
import lv.degra.accounting.customer.service.CustomerService;
import lv.degra.accounting.customerAccount.model.CustomerBankAccount;
import lv.degra.accounting.customerAccount.service.CustomerAccountService;
import lv.degra.accounting.document.bill.model.UnitType;
import lv.degra.accounting.document.bill.service.BillRowService;
import lv.degra.accounting.document.bill.service.UnitTypeService;
import lv.degra.accounting.document.dto.BillContentDto;
import lv.degra.accounting.document.dto.DocumentDto;
import lv.degra.accounting.document.enums.DocumentDirection;
import lv.degra.accounting.document.model.DocumentTransactionType;
import lv.degra.accounting.document.model.DocumentType;
import lv.degra.accounting.document.service.DocumentService;
import lv.degra.accounting.document.service.DocumentTransactionTypeService;
import lv.degra.accounting.document.service.DocumentTypeService;
import lv.degra.accounting.exchange.model.CurrencyExchangeRate;
import lv.degra.accounting.exchange.service.ExchangeService;
import lv.degra.accounting.system.configuration.service.ConfigService;
import lv.degra.accounting.system.object.DatePicker;
import lv.degra.accounting.system.object.DynamicTableView;
import lv.degra.accounting.system.utils.ApplicationFormBuilder;
import lv.degra.accounting.system.utils.DegraController;

@Controller
public class DocumentFormController extends DegraController {

	private static final String DEFAULT_DOUBLE_FIELDS_TEXT = "0";

	private static final String BILL_CODE = "BILL";
	private final ObservableList<BillContentDto> billContentObservableList = FXCollections.observableArrayList();
	@FXML
	public ComboBox<DocumentType> documentTypeCombo;
	@FXML
	public ComboBox<DocumentTransactionType> documentTransactionTypeCombo;
	@FXML
	public ComboBox<Customer> publisherCombo;
	@FXML
	public ComboBox<Bank> publisherBankCombo;
	@FXML
	public ComboBox<CustomerBankAccount> publisherBankAccountCombo;
	@FXML
	public ComboBox<Customer> receiverCombo;
	@FXML
	public ComboBox<Bank> receiverBankCombo;
	@FXML
	public ComboBox<CustomerBankAccount> receiverBankAccountCombo;
	@FXML
	public ComboBox<DocumentDirection> directionCombo;
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
	@FXML
	public Tab documentInfoTab;
	@FXML
	public Tab billContentTab;
	@FXML
	public TabPane documentTabPane;
	@FXML
	public DynamicTableView<BillContentDto> billContentListView = new DynamicTableView<>();
	@FXML
	public TextField billRowServiceNameField;
	@FXML
	public ComboBox<UnitType> billRowUnitTypeCombo;
	@FXML
	public TextField billRowQuantityField;
	@FXML
	public TextField billRowPricePerUnitField;
	@FXML
	public TextField billRowSumPerAllField;
	@FXML
	public TextField billRowVatPercentField;
	@FXML
	public TextField billRowVatSumField;
	@FXML
	public TextField billRowSumTotalField;
	@FXML
	public Button billRowSaveButton;
	@Autowired
	private ApplicationFormBuilder applicationFormBuilder;
	@Autowired
	private ApplicationContext context;
	@Autowired
	private DocumentService documentService;
	@Autowired
	private BillRowService billRowService;
	@Autowired
	private UnitTypeService unitTypeService;
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
	@Autowired
	private ConfigService configService;
	private CurrencyExchangeRate currencyExchangeRate;
	private DocumentDto documentDto;
	private BillContentDto newBillContentDto;
	private ObservableList<DocumentDto> documentObservableList;

	public static <T> Predicate<T> getDistinctValues(Function<? super T, ?> keyExtractor) {
		Set<Object> seen = ConcurrentHashMap.newKeySet();
		return t -> seen.add(keyExtractor.apply(t));
	}

	@FXML
	public void onSaveDocumentButton() {
		try {
			Integer id = documentIdLabel.getText().isEmpty() ? null : Integer.parseInt(documentIdLabel.getText());
			documentDto = new DocumentDto(id,
					directionCombo.getValue(),
					Integer.parseInt(numberField.getText()),
					seriesField.getText(),
					documentTypeCombo.getValue(),
					documentTransactionTypeCombo.getValue(),
					accountingDateDp.getValue(),
					documentDateDp.getValue(),
					paymentDateDp.getValue(),
					null,
					getDouble(sumTotalField.getText()),
					getDouble(sumTotalInCurrencyField.getText()),
					currencyCombo.getValue(),
					currencyExchangeRate,
					notesForCustomerField.getText(),
					internalNotesField.getText(),
					publisherCombo.getValue(),
					publisherBankCombo.getValue(),
					publisherBankAccountCombo.getValue(),
					receiverCombo.getValue(),
					receiverBankCombo.getValue(),
					receiverBankAccountCombo.getValue()
			);
			DocumentDto newDocument = documentService.saveDocument(documentDto);
			if (id == null) {
				this.documentObservableList.add(newDocument);
			} else {
				deletePreviousBillRowsIfExist(documentDto.getId());
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

	private void deletePreviousBillRowsIfExist(Integer documentId) {
		billRowService.deleteBillRowByDocumentId(documentId);
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

		fillDocumentBasicDataCombos();
		documentTypeCombo.setOnAction(event -> showBillTab());
		showBillTab();
		setFieldFormat(sumTotalField, SUM_FORMAT_REGEX);
		setFieldFormat(sumTotalInCurrencyField, SUM_FORMAT_REGEX);
		setDefaultValues();
	}

	private void showBillTab() {
		if (isDocumentBill()) {
			if (!documentTabPane.getTabs().contains(billContentTab)) {
				documentTabPane.getTabs().add(billContentTab);
			}
		} else {
			documentTabPane.getTabs().remove(billContentTab);
		}
	}

	boolean isDocumentBill() {
		DocumentType documentType = documentTypeCombo.getValue();
		return (documentTypeCombo != null && documentType != null && BILL_CODE.equals(documentType.getCode()));
	}

	public void setDocument(DocumentDto documentDto) {
		this.documentDto = documentDto;
		if (this.documentDto != null) {
			fillDocumentFormWithExistData(documentDto);
		}
		showBillTab();
	}

	public void setDocumentList(ObservableList<DocumentDto> documentList) {
		this.documentObservableList = documentList;
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

	private void fillDocumentFormWithExistData(DocumentDto documentDto) {
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

	private void fillDocumentBasicDataCombos() {

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

	public void currencyOnAction() {
		Currency selectedCurrency = currencyCombo.getValue();
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
		observableCustomerBankList.stream().findFirst().ifPresent(bank -> {
			bankCombo.setValue(bank);

			accountCombo.setItems(observableAccountsListBank);
			observableAccountsListBank.stream().findFirst().ifPresent(account -> accountCombo.setValue(account));
		});
		if (observableCustomerBankList.size() != 1) {
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

	@FXML
	public void addToBillRowButtonAction() {
		addRecord();
		billRowServiceNameField.requestFocus();
	}

	@Override
	protected void addRecord() {
		enableBillRowEnterFields();
		billRowServiceNameField.requestFocus();
		billRowVatPercentField.setText(configService.get(VAT_PERCENTS));
	}

	@Override
	protected void editRecord() {
		newBillContentDto = (BillContentDto) getRowFromTableView(billContentListView);
		enableBillRowEnterFields();
		fillBillRowFields(newBillContentDto);
		billRowServiceNameField.requestFocus();
	}

	@Override
	protected void deleteRecord() {
		newBillContentDto = (BillContentDto) getRowFromTableView(billContentListView);
		if (documentDto == null) {
			return;
		}
		billRowService.deleteBillRowById(documentDto.getId());
		billContentListView.getItems().removeAll(billContentListView.getSelectionModel().getSelectedItem());
	}

	private void disableBillRowEnterFields() {
		changeFieldStatus(true);
		clearBillEnterFields();
	}

	private void enableBillRowEnterFields() {
		changeFieldStatus(false);
	}

	private void changeFieldStatus(boolean setDisable) {
		billRowServiceNameField.setDisable(setDisable);
		billRowUnitTypeCombo.setDisable(setDisable);
		billRowQuantityField.setDisable(setDisable);
		billRowPricePerUnitField.setDisable(setDisable);
		billRowSumPerAllField.setDisable(setDisable);
		billRowVatPercentField.setDisable(setDisable);
		billRowVatSumField.setDisable(setDisable);
		billRowSumTotalField.setDisable(setDisable);
		billRowSaveButton.setDisable(setDisable);
	}

	@FXML
	public void billContentOpenAction() {

		billRowUnitTypeCombo.addEventFilter(KeyEvent.KEY_PRESSED, event -> {
			if (event.getCode() == KeyCode.ESCAPE) {
				disableBillRowEnterFields();
				event.consume();
			}
		});

		newBillContentDto = null;
		fillCombo(billRowUnitTypeCombo, unitTypeService.getAllUnitTypes());
		disableBillRowEnterFields();
		billRowServiceNameField.requestFocus();

		billContentListView.setType(BillContentDto.class);
		billContentListView.setCreator(item -> {
			addRecord();
			refreshBillContentTable();
		});
		billContentListView.setUpdater(item -> editRecord());
		billContentListView.setDeleter(item -> deleteRecord());

		refreshBillContentTable();
	}

	private void refreshBillContentTable() {
		billContentObservableList.clear();
		if (documentDto != null) {
			billContentObservableList.addAll(billRowService.getByDocumentId(documentDto.getId()));
			billContentListView.setData(billContentObservableList);
		}
	}

	public void onSaveRowButton() {
		var editedBillContentDto = new BillContentDto();
		try {
			editedBillContentDto = new BillContentDto(
					newBillContentDto == null ? null : newBillContentDto.getId(),
					documentDto,
					billRowServiceNameField.getText(),
					getDouble(billRowQuantityField.getText()),
					billRowUnitTypeCombo.getValue(),
					getDouble(billRowPricePerUnitField.getText()),
					getDouble(billRowSumPerAllField.getText()),
					getDouble(billRowVatPercentField.getText()),
					getDouble(billRowVatSumField.getText()),
					getDouble(billRowSumTotalField.getText())
			);

			billRowService.saveBillRow(editedBillContentDto);
		} catch (Exception e) {
			Alert alert = new Alert(Alert.AlertType.NONE);
			alert.setTitle(APPLICATION_TITLE);
			alert.setAlertType(Alert.AlertType.ERROR);
			alert.setContentText(e.getMessage());
			alert.show();
		}
		if (editedBillContentDto.getId() == null) {
			this.billContentObservableList.add(newBillContentDto);
		}
		disableBillRowEnterFields();
		refreshBillContentTable();
		BillContentDto tempDto = newBillContentDto;
		newBillContentDto = null;
		billContentListView.getSelectionModel().select(tempDto);

	}

	public void billRowQuantityOnAction() {
		String billRowQuantity = String.valueOf(getDouble(billRowQuantityField.getText()));
		billRowQuantityField.setText(billRowQuantity);
	}

	private void fillBillRowFields(BillContentDto billContentDto) {
		billRowServiceNameField.setText(billContentDto.getServiceName());
		billRowUnitTypeCombo.setValue(billContentDto.getUnitType());
		billRowQuantityField.setText(billContentDto.getQuantity().toString());
		billRowPricePerUnitField.setText(billContentDto.getPricePerUnit().toString());
		billRowSumPerAllField.setText(billContentDto.getSumPerAll().toString());
		billRowVatPercentField.setText(billContentDto.getVatPercent().toString());
		billRowVatSumField.setText(billContentDto.getVatSum().toString());
		billRowSumTotalField.setText(billContentDto.getSumTotal().toString());
	}

	private void clearBillEnterFields() {
		billRowServiceNameField.clear();
		billRowUnitTypeCombo.setValue(null);
		billRowQuantityField.clear();
		billRowPricePerUnitField.clear();
		billRowSumPerAllField.clear();
		billRowVatPercentField.clear();
		billRowVatSumField.clear();
		billRowSumTotalField.clear();
	}

	public void onKeyPressOnBillEditAction(KeyEvent keyEvent) {
		KeyCode key = keyEvent.getCode();
		if (key == KeyCode.ESCAPE) {
			clearBillEnterFields();
			disableBillRowEnterFields();
			keyEvent.consume();
		} else if (key == KeyCode.ENTER) {
			onSaveRowButton();
			keyEvent.consume();
		}
	}
}
