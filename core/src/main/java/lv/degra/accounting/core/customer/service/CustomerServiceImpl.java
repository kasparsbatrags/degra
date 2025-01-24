package lv.degra.accounting.core.customer.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import lv.degra.accounting.core.customer.model.Customer;
import lv.degra.accounting.core.customer.model.CustomerRepository;
import lv.degra.accounting.core.system.DataFetchService;

@Service
public class CustomerServiceImpl implements CustomerService, DataFetchService<Customer> {

	private final CustomerRepository customerRepository;

	@Autowired
	public CustomerServiceImpl(CustomerRepository customerRepository) {
		this.customerRepository = customerRepository;
	}

	public List<Customer> getFirst30Suggestions(String searchTerm) {
		Pageable pageable = PageRequest.of(0, 30);
		return customerRepository.getTopSuggestions(searchTerm, pageable);
	}

	public Customer getByNameAndRegistrationNumber(String name, String registrationNumber) {
		return customerRepository.getByNameAndRegistrationNumber(name, registrationNumber);
	}

	@Override
	public List<Customer> getSuggestions(String searchTerm) {
		return getFirst30Suggestions(searchTerm);
	}

	public Customer getByRegistrationNumber(String registrationNumber) {
		return customerRepository.getByRegistrationNumber(registrationNumber);
	}

}
