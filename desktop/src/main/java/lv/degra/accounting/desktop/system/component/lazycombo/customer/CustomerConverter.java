package lv.degra.accounting.desktop.system.component.lazycombo.customer;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javafx.util.StringConverter;
import lv.degra.accounting.core.customer.model.Customer;
import lv.degra.accounting.core.customer.service.CustomerService;


@Component
public class CustomerConverter extends StringConverter<Customer> {

    private final CustomerService customerService;

	@Autowired
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

