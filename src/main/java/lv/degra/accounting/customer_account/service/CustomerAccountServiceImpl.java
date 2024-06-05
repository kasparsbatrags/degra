package lv.degra.accounting.customer_account.service;

import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lv.degra.accounting.bank.model.Bank;
import lv.degra.accounting.customer.model.Customer;
import lv.degra.accounting.customer_account.model.CustomerAccount;
import lv.degra.accounting.customer_account.model.CustomerAccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
@NoArgsConstructor
public class CustomerAccountServiceImpl implements CustomerAccountService {

    @Autowired
    private CustomerAccountRepository customerAccountRepository;

    @Cacheable
    public List<CustomerAccount> getCustomerAccounts(Customer customer) {
        return customerAccountRepository.findByCustomer(customer.getId());
    }

    @Cacheable
    public ObservableList<CustomerAccount> getCustomerBankAccounts(Customer customer, Bank bank) {
        return FXCollections.observableList(customerAccountRepository.findByCustomerAndBank(customer.getId(), bank.getId()));
    }
}
