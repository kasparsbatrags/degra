package lv.degra.accounting.customer.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lombok.AllArgsConstructor;
import lv.degra.accounting.customer.model.Customer;
import lv.degra.accounting.customer.model.CustomerRepository;

@Service
@AllArgsConstructor
public class CustomerServiceImpl implements CustomerService {
	@Autowired
	private CustomerRepository customerRepository;

	public List<Customer> getCustomerList() {
		return customerRepository.findAll();
	}

}
