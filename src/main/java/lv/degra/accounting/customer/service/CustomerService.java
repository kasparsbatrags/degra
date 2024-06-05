package lv.degra.accounting.customer.service;

import java.util.List;

import lv.degra.accounting.customer.model.Customer;

public interface CustomerService {
    List<Customer> getTop30Suggestions(String searchTerm);
    Customer getByNameAndRegistrationNumber(String name, String registrationNumber);

}
