package lv.degra.accounting.document.controller;

import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.input.KeyCode;
import javafx.stage.Stage;
import lv.degra.accounting.bank.service.BankService;
import lv.degra.accounting.currency.model.Currency;
import lv.degra.accounting.currency.service.CurrencyService;
import lv.degra.accounting.customer.model.Customer;
import lv.degra.accounting.customer.model.CustomerRepository;
import lv.degra.accounting.customer.service.CustomerService;
import lv.degra.accounting.customer_account.service.CustomerAccountService;
import lv.degra.accounting.data.CustomerTypeStaticData;
import lv.degra.accounting.document.service.DocumentTransactionTypeService;
import lv.degra.accounting.document.service.DocumentTypeService;
import lv.degra.accounting.exchange.service.ExchangeService;
import lv.degra.accounting.system.configuration.service.ConfigService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.testfx.api.FxRobot;
import org.testfx.framework.junit5.ApplicationTest;

import java.time.LocalDate;

import static lv.degra.accounting.data.AddressStaticData.ADDRESS1;
import static lv.degra.accounting.data.BankDataFactory.*;
import static lv.degra.accounting.data.CurrencyDataFactory.getEurCurrency;
import static lv.degra.accounting.data.CurrencyExchangeRateDataFactory.getDefaultCurrencyExchangeRate;
import static lv.degra.accounting.data.CustomerAccountDataFactory.*;
import static lv.degra.accounting.data.CustomerDataFactory.*;
import static lv.degra.accounting.data.CustomersData.getCustomer1;
import static lv.degra.accounting.data.CustomersData.getCustomer2;
import static lv.degra.accounting.data.CustomersStaticData.*;
import static org.mockito.Mockito.when;

class DocumentInfoControllerTest extends ApplicationTest {

    @Autowired
    private CustomerRepository customerRepository;

    @Mock
    private CurrencyService currencyService;
    @Mock
    private DocumentTypeService documentTypeService;
    @Mock
    private DocumentTransactionTypeService documentTransactionTypeService;
    @Mock
    private ConfigService configService;
    @Mock
    private ExchangeService exchangeService;
    @Mock
    private CustomerService customerService;
    @Mock
    private CustomerAccountService customerAccountService;
    @Mock
    private BankService bankService;

    @InjectMocks
    private DocumentInfoController documentInfoController;


    @Override
    public void start(Stage stage) throws Exception {
        MockitoAnnotations.openMocks(this);
        when(currencyService.getDefaultCurrency()).thenReturn(getEurCurrency());
        when(exchangeService.getActuallyExchangeRate(Mockito.any(LocalDate.class), Mockito.any(Currency.class))).thenReturn(getDefaultCurrencyExchangeRate());
        when(customerService.getTop30Suggestions(CUSTOMER1_NAME)).thenReturn(getCustomer1List());
        when(customerAccountService.getCustomerAccounts(getCustomer1())).thenReturn(getCustomer1AccountList());
        when(bankService.getCustomerBanksByBanksIdList(getUniqueCustomer1BankIdList())).thenReturn(getCustomer1BankList());
        when(customerAccountService.getCustomerBankAccounts(getCustomer1(), CUSTOMER1_BANK1)).thenReturn(getCustomer1AccountList());


        when(customerService.getTop30Suggestions(CUSTOMER2_NAME)).thenReturn(getCustomer2List());
        when(customerAccountService.getCustomerAccounts(getCustomer2())).thenReturn(getCustomer2AccountList());
        when(bankService.getCustomerBanksByBanksIdList(getUniqueCustomer2BankIdList())).thenReturn(getCustomer2BankList());
        when(customerAccountService.getCustomerBankAccounts(getCustomer2(), CUSTOMER2_BANK1)).thenReturn(getCustomer2AccountList());


        FXMLLoader loader = new FXMLLoader(getClass().getResource("/document/DocumentInfoForm.fxml"));
        loader.setControllerFactory(clazz -> documentInfoController);
        Parent root = loader.load();

        Scene scene = new Scene(root);
        stage.setScene(scene);
        stage.show();
    }

    @Test
    void testCustomerDataComparison() {
        Customer mockCustomer = getCustomer1();
        Customer actualCustomer = new Customer();
        actualCustomer.setId(CUSTOMER1_ID);
        actualCustomer.setName(CUSTOMER1_NAME);
        actualCustomer.setCustomerType(createCustomerType(CustomerTypeStaticData.CUSTOMER_TYPE_LEGAL_PERSON_ID, CustomerTypeStaticData.CUSTOMER_TYPE_LEGAL_PERSON));
        actualCustomer.setRegistrationNumber(CUSTOMER1_REGISTRATION_NUMBER);
        actualCustomer.setVatNumber(CUSTOMER1_VAT_NUMBER);
        actualCustomer.setAddress(ADDRESS1);

        Assertions.assertEquals(mockCustomer.getId(), actualCustomer.getId());
        Assertions.assertEquals(mockCustomer.getName(), actualCustomer.getName());
        Assertions.assertEquals(mockCustomer.getCustomerType(), actualCustomer.getCustomerType());
        Assertions.assertEquals(mockCustomer.getRegistrationNumber(), actualCustomer.getRegistrationNumber());
        Assertions.assertEquals(mockCustomer.getVatNumber(), actualCustomer.getVatNumber());
        Assertions.assertEquals(mockCustomer.getAddress(), actualCustomer.getAddress());
    }


    @Test
    void whenSelectPublisherCustomer1ThenFillsBankInfoWithOneBankAndOneAccount() {
        FxRobot robot = new FxRobot();
        robot.clickOn("#publisherCombo");
        robot.write(CUSTOMER1_NAME);
        robot.press(KeyCode.ENTER);
        Assertions.assertEquals(getCustomer1(), documentInfoController.publisherCombo.getValue());
        Assertions.assertEquals(CUSTOMER1_BANK1, documentInfoController.publisherBankCombo.getValue());
        Assertions.assertEquals(CUSTOMER1_BANK1_ACCOUNT1, documentInfoController.publisherBankAccountCombo.getValue());
    }

    @Test
    void whenSelectPublisherCustomer2ThenFillsBankInfoWithMultipleBank() {
        FxRobot robot = new FxRobot();
        robot.clickOn("#publisherCombo");
        robot.write(CUSTOMER2_NAME);
        robot.press(KeyCode.ENTER);
        Assertions.assertEquals(getCustomer2(), documentInfoController.publisherCombo.getValue());
        Assertions.assertEquals(CUSTOMER2_BANK1, documentInfoController.publisherBankCombo.getValue());
        Assertions.assertNull(documentInfoController.publisherBankAccountCombo.getValue());
    }
}
