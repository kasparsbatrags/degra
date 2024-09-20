package lv.degra.accounting.core.customer.service;

import lv.degra.accounting.core.customer.model.Customer;
import lv.degra.accounting.core.customer.model.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;

    @Autowired
    public CustomerServiceImpl(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public List<Customer> getTop30Suggestions(String searchTerm) {
        Pageable pageable = PageRequest.of(0, 30);
        return customerRepository.getTopSuggestions(searchTerm, pageable);
    }

    public Customer getByNameAndRegistrationNumber(String name, String registrationNumber) {
        return customerRepository.getByNameAndRegistrationNumber(name, registrationNumber);
    }
}
