package lv.degra.accounting.core.user.maper;

import java.util.List;

import org.springframework.stereotype.Component;

import lv.degra.accounting.core.user.dto.UserRegistrationDto;
import lv.degra.accounting.core.user.model.User;
import lv.degra.accounting.core.useremailaddress.model.UserEmailAddress;

@Component
public class UserMapper {

	public UserRegistrationDto toDto(User user) {
		UserRegistrationDto dto = new UserRegistrationDto();
		dto.setUsername(user.getId().toString());
		dto.setFirstName(user.getGivenName());
		dto.setLastName(user.getFamilyName());
		dto.setEmail(user.getUserEmailAddress().isEmpty()
				? null
				: user.getUserEmailAddress().getFirst().getEmailAddress());
		dto.setEnabled(true);
		dto.setAttributes(null);
		dto.setCredentials(null);
		return dto;
	}

	public User toEntity(UserRegistrationDto dto) {
		User user = new User();
		user.setGivenName(dto.getFirstName());
		user.setFamilyName(dto.getLastName());

		if (dto.getEmail() != null) {
			UserEmailAddress email = new UserEmailAddress();
			email.setEmailAddress(dto.getEmail());
			email.setUser(user);
			user.setUserEmailAddress(List.of(email));
		} else {
			user.setUserEmailAddress(List.of());
		}

		user.setCustomer(null);

		return user;
	}
}
