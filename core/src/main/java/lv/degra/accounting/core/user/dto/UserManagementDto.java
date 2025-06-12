package lv.degra.accounting.core.user.dto;

import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserManagementDto {
	private String id;

	private String preferredUsername;

	private String email;
	private String givenName;
	private String familyName;
	private Map<String, String> attributes;
}