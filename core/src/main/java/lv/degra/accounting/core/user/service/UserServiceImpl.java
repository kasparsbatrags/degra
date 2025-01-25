package lv.degra.accounting.core.user.service;

import java.util.Optional;

import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import lv.degra.accounting.core.customer.service.CustomerService;
import lv.degra.accounting.core.user.dto.UserRegistrationDto;
import lv.degra.accounting.core.user.maper.UserMapper;
import lv.degra.accounting.core.user.model.User;
import lv.degra.accounting.core.user.model.UserRepository;

@Service
public class UserServiceImpl implements UserService {

	private final UserRepository userRepository;
	private final UserMapper userMapper;

	public UserServiceImpl(UserRepository userRepository, UserMapper userMapper, CustomerService customerService) {
		this.userRepository = userRepository;
		this.userMapper = userMapper;
	}

	@Transactional
	public User saveUser(User user) {
		return userRepository.save(user);
	}

	public User buildUser(UserRegistrationDto userRegistrationDto) {
		User user = userMapper.toEntity(userRegistrationDto);
		return user;
	}

	@Override
	public Optional<User> getUserById(Integer userId) {
		return userRepository.findById(Long.valueOf(userId));
	}

}
