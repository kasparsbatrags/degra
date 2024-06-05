package lv.degra.accounting.system.object.lazycombo;

import javafx.util.StringConverter;
import lv.degra.accounting.customer.model.Customer;
import lv.degra.accounting.customer.service.CustomerService;
import org.springframework.stereotype.Component;


@Component
public class CustomerConverter extends StringConverter<Customer> {

    private final CustomerService customerService;

    public CustomerConverter(CustomerService customerService) {
        this.customerService = customerService;
    }

    @Override
    public String toString(Customer customer) {
        if (customer == null) {
            return null;
        }
        return customer.getName() + " - " + customer.getRegistrationNumber();
    }

    @Override
    public Customer fromString(String customerString) {
        if (customerString == null || customerString.trim().isEmpty()) {
            return null;
        }
        String[] parts = customerString.split("-");
        if (parts.length != 2) {
            return null;
        }
        return customerService.getByNameAndRegistrationNumber(parts[0].trim(), parts[1].trim());
    }
}

