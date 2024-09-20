package lv.degra.accounting.core.customer.service;

import java.util.List;

import lv.degra.accounting.core.customer.model.Customer;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

public interface CustomerService {
    Pageable pageable = PageRequest.of(0, 30);
    List<Customer> getTop30Suggestions(String searchTerm);
    Customer getByNameAndRegistrationNumber(String name, String registrationNumber);

}
