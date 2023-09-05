package lv.degra.accounting.customer.service;

import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import lombok.AllArgsConstructor;
import lv.degra.accounting.customer.model.Customer;
import lv.degra.accounting.customer.model.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class CustomerServiceImpl implements CustomerService {
    @Autowired
    private CustomerRepository customerRepository;

    public ObservableList<Customer> getCustomerByNameOrRegistrationNumber() {
        return FXCollections.observableList(customerRepository.findAll());
    }

}
