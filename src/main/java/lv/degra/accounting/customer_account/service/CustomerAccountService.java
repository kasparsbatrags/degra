package lv.degra.accounting.customer_account.service;

import lv.degra.accounting.bank.model.Bank;
import lv.degra.accounting.customer.model.Customer;
import lv.degra.accounting.customer_account.model.CustomerAccount;

import java.util.List;

public interface CustomerAccountService {
    List<CustomerAccount> getCustomerAccounts(Customer customer);

    List<CustomerAccount> getCustomerBankAccounts(Customer customer, Bank bank);
}
