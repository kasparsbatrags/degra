package lv.degra.accounting.core.user.model;

import java.io.Serializable;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import lv.degra.accounting.core.auditor.model.AuditInfo;
import lv.degra.accounting.core.truck_user_map.model.TruckUserMap;

@Getter
@Setter
@Entity
@Table(name = "user")
public class User extends AuditInfo implements Serializable {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false)
	private Integer id;

	@Column(name = "user_id", unique = true, nullable = false)
	private String userId;

	@Column(name = "refresh_token", length = 4096)
	private String refreshToken;

	@Column(name = "last_login_time")
	private Instant lastLoginTime;

	@OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<TruckUserMap> truckMappings = new ArrayList<>();

	public void addTruckMapping(TruckUserMap mapping) {
		this.truckMappings.add(mapping);
		mapping.setUser(this);
	}

	public void removeTruckMapping(TruckUserMap mapping) {
		this.truckMappings.remove(mapping);
		mapping.setUser(null);
	}
}
