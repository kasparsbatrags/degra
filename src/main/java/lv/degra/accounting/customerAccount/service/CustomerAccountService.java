package lv.degra.accounting.customerAccount.service;

import javafx.collections.ObservableList;
import lv.degra.accounting.customer.model.Customer;
import lv.degra.accounting.customerAccount.model.CustomerBankAccount;

public interface CustomerAccountService {
    ObservableList<CustomerBankAccount> getCustomerAccounts(Customer customer);
}
