package lv.degra.accounting.core.customer.service;

import java.util.List;

import lv.degra.accounting.core.customer.model.Customer;
import lv.degra.accounting.core.system.DataFetcher;

public interface CustomerService extends DataFetcher<Customer> {

	List<Customer> getFirst30Suggestions(String searchTerm);

	Customer getByNameAndRegistrationNumber(String name, String registrationNumber);

	Customer getByRegistrationNumber(String registrationNumber);

}
