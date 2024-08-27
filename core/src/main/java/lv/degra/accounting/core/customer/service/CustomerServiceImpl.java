package lv.degra.accounting.core.customer.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lv.degra.accounting.core.customer.model.Customer;
import lv.degra.accounting.core.customer.model.CustomerRepository;

@Service
public class CustomerServiceImpl implements CustomerService {

	private final CustomerRepository customerRepository;

	@Autowired
	public CustomerServiceImpl(CustomerRepository customerRepository) {
		this.customerRepository = customerRepository;
	}

	public List<Customer> getTop30Suggestions(String searchTerm) {
		return customerRepository.getTop30Suggestions(searchTerm);
	}

	public Customer getByNameAndRegistrationNumber(String name, String registrationNumber) {
		return customerRepository.getByNameAndRegistrationNumber(name, registrationNumber);
	}
}
