package lv.degra.accounting.core.user.service;

import java.util.Optional;

import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import lv.degra.accounting.core.customer.exception.CustomerNotFoundException;
import lv.degra.accounting.core.customer.model.Customer;
import lv.degra.accounting.core.customer.service.CustomerService;
import lv.degra.accounting.core.user.dto.UserRegistrationDto;
import lv.degra.accounting.core.user.exception.UserUniqueException;
import lv.degra.accounting.core.user.maper.UserMapper;
import lv.degra.accounting.core.user.model.User;
import lv.degra.accounting.core.user.model.UserRepository;

@Service
public class UserServiceImpl implements UserService {

	private final UserRepository userRepository;
	private final UserMapper userMapper;
	private final CustomerService customerService;

	public UserServiceImpl(UserRepository userRepository, UserMapper userMapper, CustomerService customerService) {
		this.userRepository = userRepository;
		this.userMapper = userMapper;
		this.customerService = customerService;
	}

	@Transactional
	public User saveUser(User user) {
		validateUserUniqueness(user);
		return userRepository.save(user);
	}

	private void validateUserUniqueness(User user) {
		User existUser = userRepository.searchUserByCustomerAndFamilyNameAndGivenName(user.getCustomer(),user.getFamilyName(),user.getGivenName());
		if (existUser != null) {
			throw new UserUniqueException("User already exists");
		}
	}

	public User buildUser(UserRegistrationDto userRegistrationDto) {
		User user = userMapper.toEntity(userRegistrationDto);
		Customer customer = getCustomerByRegistrationNumber(userRegistrationDto.getAttributes().get("organizationRegistrationNumber"));
		user.setCustomer(customer);
		return user;
	}

	@Override
	public Optional<User> getUserById(Integer userId) {
		return userRepository.findById(Long.valueOf(userId));
	}

	private Customer getCustomerByRegistrationNumber(String registrationNumber) {
		Customer customer = customerService.getByRegistrationNumber(registrationNumber);
		if (customer == null) {
			throw new CustomerNotFoundException("Customer with registration number " + registrationNumber + " not found in the database.");
		}
		return customer;
	}

}
