package lv.degra.accounting.core.user;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CredentialDto {
	@NotBlank(message = "Credential type is required")
	private String type;

	@NotBlank(message = "Credential value is required")
	private String value;
}
