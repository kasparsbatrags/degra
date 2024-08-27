package lv.degra.accounting.core.customer_account.service;

import lv.degra.accounting.core.bank.model.Bank;
import lv.degra.accounting.core.customer.model.Customer;
import lv.degra.accounting.core.customer_account.model.CustomerAccount;

import java.util.List;

public interface CustomerAccountService {
    List<CustomerAccount> getCustomerAccounts(Customer customer);

    List<CustomerAccount> getCustomerBankAccounts(Customer customer, Bank bank);
}
