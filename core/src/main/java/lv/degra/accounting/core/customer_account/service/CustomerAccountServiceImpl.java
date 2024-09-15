package lv.degra.accounting.core.customer_account.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import lv.degra.accounting.core.bank.model.Bank;
import lv.degra.accounting.core.customer.model.Customer;
import lv.degra.accounting.core.customer_account.model.CustomerAccount;
import lv.degra.accounting.core.customer_account.model.CustomerAccountRepository;

@Service
public class CustomerAccountServiceImpl implements CustomerAccountService {

	private final CustomerAccountRepository customerAccountRepository;

	@Autowired
	public CustomerAccountServiceImpl(CustomerAccountRepository customerAccountRepository) {
		this.customerAccountRepository = customerAccountRepository;
	}

	@Cacheable("customer_account")
	public List<CustomerAccount> getCustomerAccounts(Customer customer) {
		return customerAccountRepository.findByCustomer(customer.getId());
	}

	@Cacheable("customer_bank_accounts")
	public List<CustomerAccount> getCustomerBankAccounts(Customer customer, Bank bank) {
		return customerAccountRepository.findByCustomerAndBank(customer.getId(), bank.getId());
	}
}
