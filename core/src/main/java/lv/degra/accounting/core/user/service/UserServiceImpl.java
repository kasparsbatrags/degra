package lv.degra.accounting.core.user.service;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import lv.degra.accounting.core.user.dto.UserDto;
import lv.degra.accounting.core.user.model.User;
import lv.degra.accounting.core.user.model.UserRepository;

@Service
public class UserServiceImpl implements UserService {

	private final UserRepository userRepository;
	private final ModelMapper modelMapper;

	public UserServiceImpl(UserRepository userRepository,
			ModelMapper modelMapper) {
		this.userRepository = userRepository;
		this.modelMapper = modelMapper;
	}

	public UserDto getUserDtoByUserId(String userId) {
		return userRepository.findByUserId(userId)
				.map((element) -> modelMapper.map(element, UserDto.class))
				.orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));
	}

	public User getUserByUserId(String userId) {
		return userRepository.findByUserId(userId)
				.orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));
	}



	public User saveUser(String userId) {
		User user = new User();
		user.setUserId(userId);
		return userRepository.save(user);
	}
}
