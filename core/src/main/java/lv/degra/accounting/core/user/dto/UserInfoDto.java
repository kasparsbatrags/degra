package lv.degra.accounting.core.user.dto;

import java.util.Map;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserInfoDto {
	private String preferred_username;
	private String email;
	private String given_name;
	private String family_name;
	private Map<String, String> attributes;
}