package lv.degra.accounting.core.customer.service;

import java.util.List;

import lv.degra.accounting.core.customer.model.Customer;

public interface CustomerService {
    List<Customer> getTop30Suggestions(String searchTerm);
    Customer getByNameAndRegistrationNumber(String name, String registrationNumber);

}
