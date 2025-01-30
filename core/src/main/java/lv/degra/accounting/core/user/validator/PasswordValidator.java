package lv.degra.accounting.core.user.validator;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

import lv.degra.accounting.core.user.exception.UserValidationException;

public class PasswordValidator {
	private static final int MIN_LENGTH = 8;
	private static final Pattern UPPERCASE_PATTERN = Pattern.compile(".*[A-Z].*");
	private static final Pattern LOWERCASE_PATTERN = Pattern.compile(".*[a-z].*");
	private static final Pattern DIGIT_PATTERN = Pattern.compile(".*\\d.*");
	private static final Pattern SPECIAL_CHAR_PATTERN =
			Pattern.compile(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?].*");

	public void validate(String password) {
		List<String> violations = new ArrayList<>();

		if (password == null || password.length() < MIN_LENGTH) {
			violations.add("Password must be at least 8 characters long");
		}

		if (password != null) {
			if (!UPPERCASE_PATTERN.matcher(password).matches()) {
				violations.add("Password must contain at least one uppercase letter");
			}
			if (!LOWERCASE_PATTERN.matcher(password).matches()) {
				violations.add("Password must contain at least one lowercase letter");
			}
			if (!DIGIT_PATTERN.matcher(password).matches()) {
				violations.add("Password must contain at least one number");
			}
			if (!SPECIAL_CHAR_PATTERN.matcher(password).matches()) {
				violations.add("Password must contain at least one special character");
			}
		}

		if (!violations.isEmpty()) {
			throw new UserValidationException(String.join("; ", violations));
		}
	}
}