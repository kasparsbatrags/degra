package lv.degra.accounting.core.customer_account.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import lv.degra.accounting.core.bank.model.Bank;
import lv.degra.accounting.core.customer.model.Customer;
import lv.degra.accounting.core.customer_account.model.CustomerAccount;
import lv.degra.accounting.core.customer_account.model.CustomerAccountRepository;

class CustomerAccountServiceImplTest {

	@Mock
	private CustomerAccountRepository customerAccountRepository;

	@InjectMocks
	private CustomerAccountServiceImpl customerAccountService;

	private Customer mockCustomer;
	private Bank mockBank;
	private CustomerAccount mockAccount;

	@BeforeEach
	void setUp() {
		MockitoAnnotations.openMocks(this);

		mockCustomer = new Customer();
		mockCustomer.setId(1); // Mocked customer ID

		mockBank = new Bank();
		mockBank.setId(1); // Mocked bank ID

		mockAccount = new CustomerAccount();
		mockAccount.setId(1);
		mockAccount.setAccount("LV1234567890123456789");
		mockAccount.setCustomer(mockCustomer);
		mockAccount.setBank(mockBank);
	}

	@Test
	void testGetCustomerAccounts_ReturnsCustomerAccounts() {
		// Arrange
		when(customerAccountRepository.getByCustomerId(mockCustomer.getId()))
				.thenReturn(Collections.singletonList(mockAccount));

		// Act
		List<CustomerAccount> accounts = customerAccountService.getCustomerAccounts(mockCustomer);

		// Assert
		assertNotNull(accounts, "Accounts list should not be null");
		assertEquals(1, accounts.size(), "Accounts list should contain one account");
		assertEquals(mockAccount, accounts.get(0), "Returned account should match mock account");
		verify(customerAccountRepository, times(1)).getByCustomerId(mockCustomer.getId());
	}

	@Test
	void testGetCustomerAccounts_NoAccountsFound() {
		// Arrange
		when(customerAccountRepository.getByCustomerId(mockCustomer.getId())).thenReturn(Collections.emptyList());

		// Act
		List<CustomerAccount> accounts = customerAccountService.getCustomerAccounts(mockCustomer);

		// Assert
		assertNotNull(accounts, "Accounts list should not be null");
		assertTrue(accounts.isEmpty(), "Accounts list should be empty");
		verify(customerAccountRepository, times(1)).getByCustomerId(mockCustomer.getId());
	}

	@Test
	void testGetCustomerBankAccounts_ReturnsCustomerBankAccounts() {
		// Arrange
		when(customerAccountRepository.findByCustomerIdAndBankId(mockCustomer.getId(), mockBank.getId()))
				.thenReturn(Collections.singletonList(mockAccount));

		// Act
		List<CustomerAccount> accounts = customerAccountService.getCustomerBankAccounts(mockCustomer, mockBank);

		// Assert
		assertNotNull(accounts, "Accounts list should not be null");
		assertEquals(1, accounts.size(), "Accounts list should contain one account");
		assertEquals(mockAccount, accounts.get(0), "Returned account should match mock account");
		verify(customerAccountRepository, times(1))
				.findByCustomerIdAndBankId(mockCustomer.getId(), mockBank.getId());
	}

	@Test
	void testGetCustomerBankAccounts_NoAccountsFound() {
		// Arrange
		when(customerAccountRepository.findByCustomerIdAndBankId(mockCustomer.getId(), mockBank.getId()))
				.thenReturn(Collections.emptyList());

		// Act
		List<CustomerAccount> accounts = customerAccountService.getCustomerBankAccounts(mockCustomer, mockBank);

		// Assert
		assertNotNull(accounts, "Accounts list should not be null");
		assertTrue(accounts.isEmpty(), "Accounts list should be empty");
		verify(customerAccountRepository, times(1))
				.findByCustomerIdAndBankId(mockCustomer.getId(), mockBank.getId());
	}
}
