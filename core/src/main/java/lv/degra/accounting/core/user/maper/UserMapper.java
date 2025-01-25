package lv.degra.accounting.core.user.maper;

import org.springframework.stereotype.Component;

import lv.degra.accounting.core.user.dto.UserRegistrationDto;
import lv.degra.accounting.core.user.model.User;

@Component
public class UserMapper {

	public UserRegistrationDto toDto(User user) {
		UserRegistrationDto dto = new UserRegistrationDto();
		dto.setUsername(user.getId().toString());
		dto.setEnabled(true);
		dto.setAttributes(null);
		dto.setCredentials(null);
		return dto;
	}

	public User toEntity(UserRegistrationDto dto) {
		User user = new User();
		return user;
	}
}
