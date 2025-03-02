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
	private String preferred_username;
	private String email;
	private String given_name;
	private String family_name;
	private Map<String, String> attributes;
}