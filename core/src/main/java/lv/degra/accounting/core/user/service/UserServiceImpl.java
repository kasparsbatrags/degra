package lv.degra.accounting.core.user.service;

import java.util.Optional;

import org.springframework.stereotype.Service;

import lv.degra.accounting.core.user.model.User;
import lv.degra.accounting.core.user.model.UserRepository;

@Service
public class UserServiceImpl implements UserService {

	private final UserRepository userRepository;

	public UserServiceImpl(UserRepository userRepository) {
		this.userRepository = userRepository;
	}
	@Override
	public Optional<User> getByUserId(String userId) {
		return userRepository.findByUserId(userId);
	}

	public User saveUser(String userId) {
		User user = new User();
		user.setUserId(userId);
		return userRepository.save(user);
	}
}
