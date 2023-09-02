package lv.degra.accounting.customer.service;

import javafx.collections.ObservableList;
import lv.degra.accounting.customer.model.Customer;

public interface CustomerService {
    ObservableList<Customer> getCustomerByNameOrRegistrationNumber();
}
