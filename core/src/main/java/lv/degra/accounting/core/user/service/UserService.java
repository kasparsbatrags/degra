package lv.degra.accounting.core.user.service;

import org.springframework.stereotype.Service;

import lv.degra.accounting.core.user.dto.UserDto;
import lv.degra.accounting.core.user.model.User;

@Service
public interface UserService {

	UserDto getUserDtoByUserId(String userId);

	User getUserByUserId(String userId);

	User saveUser(String userId);
}
