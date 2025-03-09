package lv.degra.accounting.core.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequestDto {

	@Schema(description = "User's email address", example = "user@example.com")
	@Email(message = "Invalid email format")
	@NotBlank(message = "Email is required")
	private String email;

	@Schema(description = "User's password", example = "P@ssw0rd!")
	@NotBlank(message = "Password is required")
	private String password;
}
