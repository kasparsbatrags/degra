//package lv.degra.accounting.desktop.document.controller;
//
//import static lv.degra.accounting.core.document.dataFactories.AddressStaticData.ADDRESS1;
//import static lv.degra.accounting.core.document.dataFactories.BankDataFactory.ACUSTOMER_SWED_BANK;
//import static lv.degra.accounting.core.document.dataFactories.BankDataFactory.BCUSTOMER_SWED_BANK;
//import static lv.degra.accounting.core.document.dataFactories.BankDataFactory.getCustomer1BankList;
//import static lv.degra.accounting.core.document.dataFactories.BankDataFactory.getCustomer2BankList;
//import static lv.degra.accounting.core.document.dataFactories.BankDataFactory.getUniqueCustomer1BankIdList;
//import static lv.degra.accounting.core.document.dataFactories.BankDataFactory.getUniqueCustomer2BankIdList;
//import static lv.degra.accounting.core.currency.CurrencyDataFactory.getEurCurrency;
//import static lv.degra.accounting.core.exchange.CurrencyExchangeRateDataFactory.getDefaultCurrencyExchangeRate;
//import static lv.degra.accounting.core.document.dataFactories.CustomerAccountDataFactory.CUSTOMER1_BANK1_ACCOUNT1;
//import static lv.degra.accounting.core.document.dataFactories.CustomerAccountDataFactory.getCustomer1AccountList;
//import static lv.degra.accounting.core.document.dataFactories.CustomerAccountDataFactory.getCustomer2AccountList;
//import static lv.degra.accounting.core.document.dataFactories.CustomerDataFactory.createCustomerType;
//import static lv.degra.accounting.core.document.dataFactories.CustomerDataFactory.getCustomer1List;
//import static lv.degra.accounting.core.document.dataFactories.CustomerDataFactory.getCustomer2List;
//import static lv.degra.accounting.core.document.dataFactories.CustomersData.getCustomer1;
//import static lv.degra.accounting.core.document.dataFactories.CustomersData.getCustomer2;
//import static lv.degra.accounting.core.document.dataFactories.CustomersStaticData.CUSTOMER1_ID;
//import static lv.degra.accounting.core.document.dataFactories.CustomersStaticData.CUSTOMER1_NAME;
//import static lv.degra.accounting.core.document.dataFactories.CustomersStaticData.CUSTOMER1_REGISTRATION_NUMBER;
//import static lv.degra.accounting.core.document.dataFactories.CustomersStaticData.CUSTOMER1_VAT_NUMBER;
//import static lv.degra.accounting.core.document.dataFactories.CustomersStaticData.CUSTOMER2_NAME;
//import static lv.degra.accounting.core.document.dataFactories.DocumentDirectionDataFactory.getDocumentDirectionList;
//import static lv.degra.accounting.core.document.dataFactories.DocumentSubTypeDataFactory.getDocumentSubTypeList;
//import static org.mockito.ArgumentMatchers.anyInt;
//import static org.mockito.Mockito.never;
//import static org.mockito.Mockito.verify;
//import static org.mockito.Mockito.when;
//
//import java.time.LocalDate;
//
//import org.junit.jupiter.api.AfterEach;
//import org.junit.jupiter.api.Assertions;
//import org.junit.jupiter.api.Test;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.Mockito;
//import org.mockito.MockitoAnnotations;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.testfx.api.FxRobot;
//import org.testfx.framework.junit5.ApplicationTest;
//import org.testfx.util.WaitForAsyncUtils;
//
//import javafx.application.Platform;
//import javafx.fxml.FXMLLoader;
//import javafx.scene.Parent;
//import javafx.scene.Scene;
//import javafx.scene.input.KeyCode;
//import javafx.stage.Stage;
//import lv.degra.accounting.core.bank.service.BankService;
//import lv.degra.accounting.core.currency.model.Currency;
//import lv.degra.accounting.core.currency.service.CurrencyService;
//import lv.degra.accounting.core.customer.model.Customer;
//import lv.degra.accounting.core.customer.model.CustomerRepository;
//import lv.degra.accounting.core.customer.service.CustomerService;
//import lv.degra.accounting.core.customer_account.service.CustomerAccountService;
//import lv.degra.accounting.core.document.model.DocumentSubType;
//import lv.degra.accounting.core.document.service.DocumentDirectionService;
//import lv.degra.accounting.core.document.service.DocumentSubTypeService;
//import lv.degra.accounting.core.document.service.DocumentTransactionTypeService;
//import lv.degra.accounting.core.document.service.DocumentTypeService;
//import lv.degra.accounting.core.exchange.service.ExchangeService;
//import lv.degra.accounting.core.system.configuration.service.ConfigService;
//import lv.degra.accounting.core.document.dataFactories.CustomerTypeStaticData;
//import lv.degra.accounting.desktop.system.component.lazycombo.ComboBoxWithErrorLabel;
//import lv.degra.accounting.desktop.validation.service.ValidationService;
//
//class InfoControllerTest extends ApplicationTest {
//
//	@Autowired
//	private CustomerRepository customerRepository;
//	@Mock
//	private CurrencyService currencyService;
//	@Mock
//	private DocumentTypeService documentTypeService;
//	@Mock
//	private DocumentTransactionTypeService documentTransactionTypeService;
//	@Mock
//	private ConfigService configService;
//	@Mock
//	private ExchangeService exchangeService;
//	@Mock
//	private CustomerService customerService;
//	@Mock
//	private CustomerAccountService customerAccountService;
//	@Mock
//	private DocumentSubTypeService documentSubTypeService;
//	@Mock
//	private DocumentDirectionService documentDirectionService;
//	@Mock
//	private ValidationService validationService;
//
//	@Mock
//	private BankService bankService;
//	@InjectMocks
//	private InfoController infoController;
//
//	private AutoCloseable mocks;
//	private ComboBoxWithErrorLabel<DocumentSubType> documentSubTypeCombo;
//
//	@AfterEach
//	public void tearDown() throws Exception {
//		if (mocks != null) {
//			mocks.close();
//		}
//		WaitForAsyncUtils.waitForFxEvents();
//		Platform.runLater(() -> {
//			Stage stage = (Stage) infoController.publisherCombo.getScene().getWindow();
//			if (stage != null) {
//				stage.close();
//			}
//		});
//		WaitForAsyncUtils.waitForFxEvents();
//	}
//
//	@Override
//	public void start(Stage stage) throws Exception {
//		mocks = MockitoAnnotations.openMocks(this);
//		when(documentSubTypeService.getDocumentSubTypeList()).thenReturn(getDocumentSubTypeList());
//		when(documentSubTypeService.getDocumentSubTypeList()).thenReturn(getDocumentSubTypeList());
//		when(documentDirectionService.getDocumentDirectionList()).thenReturn(getDocumentDirectionList());
//
//		when(currencyService.getDefaultCurrency()).thenReturn(getEurCurrency());
//		when(exchangeService.getActuallyExchangeRate(Mockito.any(LocalDate.class), Mockito.any(Currency.class))).thenReturn(
//				getDefaultCurrencyExchangeRate());
//		when(customerService.getTop30Suggestions(CUSTOMER1_NAME)).thenReturn(getCustomer1List());
//		when(customerAccountService.getCustomerAccounts(getCustomer1())).thenReturn(getCustomer1AccountList());
//		when(bankService.getCustomerBanksByBanksIdList(getUniqueCustomer1BankIdList())).thenReturn(getCustomer1BankList());
//		when(customerAccountService.getCustomerBankAccounts(getCustomer1(), ACUSTOMER_SWED_BANK)).thenReturn(getCustomer1AccountList());
//
//		when(customerService.getTop30Suggestions(CUSTOMER2_NAME)).thenReturn(getCustomer2List());
//		when(customerAccountService.getCustomerAccounts(getCustomer2())).thenReturn(getCustomer2AccountList());
//		when(bankService.getCustomerBanksByBanksIdList(getUniqueCustomer2BankIdList())).thenReturn(getCustomer2BankList());
//		when(customerAccountService.getCustomerBankAccounts(getCustomer2(), BCUSTOMER_SWED_BANK)).thenReturn(getCustomer2AccountList());
//
//		FXMLLoader loader = new FXMLLoader(getClass().getResource("/document/DocumentInfoForm.fxml"));
//		loader.setControllerFactory(clazz -> infoController);
//		Parent root = loader.load();
//
//		Scene scene = new Scene(root);
//		stage.setScene(scene);
//		stage.show();
//	}
//
//	@Test
//	void testCustomerDataComparison() {
//		Customer mockCustomer = getCustomer1();
//		Customer actualCustomer = new Customer();
//		actualCustomer.setId(CUSTOMER1_ID);
//		actualCustomer.setName(CUSTOMER1_NAME);
//		actualCustomer.setCustomerType(createCustomerType(CustomerTypeStaticData.CUSTOMER_TYPE_LEGAL_PERSON_ID,
//				CustomerTypeStaticData.CUSTOMER_TYPE_LEGAL_PERSON));
//		actualCustomer.setRegistrationNumber(CUSTOMER1_REGISTRATION_NUMBER);
//		actualCustomer.setVatNumber(CUSTOMER1_VAT_NUMBER);
//		actualCustomer.setAddress(ADDRESS1);
//
//		Assertions.assertEquals(mockCustomer.getId(), actualCustomer.getId());
//		Assertions.assertEquals(mockCustomer.getName(), actualCustomer.getName());
//		Assertions.assertEquals(mockCustomer.getCustomerType(), actualCustomer.getCustomerType());
//		Assertions.assertEquals(mockCustomer.getRegistrationNumber(), actualCustomer.getRegistrationNumber());
//		Assertions.assertEquals(mockCustomer.getVatNumber(), actualCustomer.getVatNumber());
//		Assertions.assertEquals(mockCustomer.getAddress(), actualCustomer.getAddress());
//	}
//
//	@Test
//	void whenSelectPublisherCustomer1ThenFillsBankInfoWithOneBankAndOneAccount() {
//		FxRobot robot = new FxRobot();
//		robot.clickOn("#publisherCombo");
//		robot.write(CUSTOMER1_NAME);
//		robot.press(KeyCode.ENTER);
//		Assertions.assertEquals(getCustomer1(), infoController.publisherCombo.getValue());
//		Assertions.assertEquals(ACUSTOMER_SWED_BANK, infoController.publisherBankCombo.getValue());
//		Assertions.assertEquals(CUSTOMER1_BANK1_ACCOUNT1, infoController.publisherBankAccountCombo.getValue());
//	}
//
//	@Test
//	void whenSelectPublisherCustomer2ThenFillsBankInfoWithMultipleBank() {
//		FxRobot robot = new FxRobot();
//		robot.clickOn("#publisherCombo");
//		robot.write(CUSTOMER2_NAME);
//		robot.press(KeyCode.ENTER);
//		Assertions.assertEquals(getCustomer2(), infoController.publisherCombo.getValue());
//		Assertions.assertEquals(BCUSTOMER_SWED_BANK, infoController.publisherBankCombo.getValue());
//		Assertions.assertNull(infoController.publisherBankAccountCombo.getValue());
//	}
//
//	@Test
//	void testSetDocumentInfoValidationRules_documentSubTypeCombo_is_NullCombo() {
//		infoController.setDocumentInfoValidationRules();
//		verify(validationService, never()).getValidationRulesByDocumentSybType(anyInt());
//	}
//
//	@Test
//	void testSetDocumentInfoValidationRules_documentSubTypeCombo_have_NullComboValue() {
//		documentSubTypeCombo = new ComboBoxWithErrorLabel<>();
//		documentSubTypeCombo.setValue(null);
//		infoController.setDocumentInfoValidationRules();
//		verify(validationService, never()).getValidationRulesByDocumentSybType(anyInt());
//	}
//
//}
//
