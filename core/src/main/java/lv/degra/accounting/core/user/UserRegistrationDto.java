package lv.degra.accounting.core.user;

import java.util.List;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserRegistrationDto {

	@NotBlank(message = "Username is required")
	private String username;

	@NotBlank(message = "Email is required")
	@Email(message = "Invalid email format")
	private String email;

	@NotBlank(message = "First name is required")
	private String firstName;

	@NotBlank(message = "Last name is required")
	private String lastName;

	@NotBlank(message = "Organization registration number is required")
	private String organizationRegistrationNumber;

	@NotNull(message = "Enabled status is required")
	private Boolean enabled;

	@NotNull(message = "Credentials are required")
	private List<CredentialDto> credentials;
}