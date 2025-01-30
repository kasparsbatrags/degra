package lv.degra.accounting.core.customer.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import lv.degra.accounting.core.customer.model.Customer;
import lv.degra.accounting.core.customer.model.CustomerRepository;

class CustomerServiceImplTest {

	private CustomerRepository customerRepository;
	private CustomerServiceImpl customerService;

	@BeforeEach
	void setUp() {
		customerRepository = mock(CustomerRepository.class);
		customerService = new CustomerServiceImpl(customerRepository);
	}

	@Test
	void testGetFirst30Suggestions() {
		String searchTerm = "Test";
		Pageable pageable = PageRequest.of(0, 30);
		List<Customer> mockCustomers = Arrays.asList(new Customer(), new Customer());
		when(customerRepository.getTopSuggestions(searchTerm, pageable)).thenReturn(mockCustomers);

		List<Customer> result = customerService.getFirst30Suggestions(searchTerm);

		assertEquals(mockCustomers, result);
		verify(customerRepository, times(1)).getTopSuggestions(searchTerm, pageable);
	}

	@Test
	void testGetFirst30Suggestions_EmptyResult() {
		String searchTerm = "Empty";
		Pageable pageable = PageRequest.of(0, 30);
		when(customerRepository.getTopSuggestions(searchTerm, pageable)).thenReturn(List.of());

		List<Customer> result = customerService.getFirst30Suggestions(searchTerm);

		assertEquals(0, result.size());
		verify(customerRepository, times(1)).getTopSuggestions(searchTerm, pageable);
	}

	@Test
	void testGetByNameAndRegistrationNumber() {
		String name = "Company ABC";
		String registrationNumber = "123456";
		Customer mockCustomer = new Customer();
		when(customerRepository.getByNameAndRegistrationNumber(name, registrationNumber)).thenReturn(mockCustomer);

		Customer result = customerService.getByNameAndRegistrationNumber(name, registrationNumber);

		assertEquals(mockCustomer, result);
		verify(customerRepository, times(1)).getByNameAndRegistrationNumber(name, registrationNumber);
	}

	@Test
	void testGetByNameAndRegistrationNumber_NotFound() {
		String name = "Unknown Company";
		String registrationNumber = "000000";
		when(customerRepository.getByNameAndRegistrationNumber(name, registrationNumber)).thenReturn(null);

		Customer result = customerService.getByNameAndRegistrationNumber(name, registrationNumber);

		assertNull(result);
		verify(customerRepository, times(1)).getByNameAndRegistrationNumber(name, registrationNumber);
	}

	@Test
	void testGetSuggestions() {
		String searchTerm = "Suggestion";
		List<Customer> mockCustomers = Arrays.asList(new Customer(), new Customer());
		when(customerRepository.getTopSuggestions(searchTerm, PageRequest.of(0, 30))).thenReturn(mockCustomers);

		List<Customer> result = customerService.getSuggestions(searchTerm);

		assertEquals(mockCustomers, result);
		verify(customerRepository, times(1)).getTopSuggestions(searchTerm, PageRequest.of(0, 30));
	}
}
