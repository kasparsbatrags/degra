package lv.degra.accounting.customer.service;

import javafx.collections.ObservableList;
import lv.degra.accounting.customer.model.Customer;

import java.util.List;

public interface CustomerService {
    ObservableList<Customer> getCustomerByNameOrRegistrationNumber();
}
