package lv.degra.accounting.core.user.dto;

import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

import lombok.Value;
import lv.degra.accounting.core.truck_user_map.model.TruckUserMap;

/**
 * DTO for {@link lv.degra.accounting.core.user.model.User}
 */
@Value
public class UserDto implements Serializable {
	LocalDateTime createdDateTime;
	LocalDateTime lastModifiedDateTime;
	Integer id;
	String userId;
	String refreshToken;
	Instant lastLoginTime;
	List<TruckUserMap> truckMappings;
}