package lv.degra.accounting.core.user.service;

import java.util.Optional;

import org.springframework.stereotype.Service;

import lv.degra.accounting.core.user.model.User;

@Service
public interface UserService {

	Optional<User> getByUserId(String userId);
}
