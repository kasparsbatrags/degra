package lv.degra.accounting.core.user.service;

import java.util.Optional;

import org.springframework.stereotype.Service;

import lv.degra.accounting.core.user.dto.UserRegistrationDto;
import lv.degra.accounting.core.user.model.User;

@Service
public interface UserService {
	User saveUser(User user);

	User buildUser(UserRegistrationDto userRegistrationDto);

	Optional<User> getUserById(Integer userId);
}
