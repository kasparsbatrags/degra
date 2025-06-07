package lv.degra.accounting.core.truck_user_map.model;

import java.io.Serializable;
import java.util.UUID;

import org.hibernate.envers.Audited;
import org.hibernate.envers.NotAudited;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lv.degra.accounting.core.auditor.model.AuditInfo;
import lv.degra.accounting.core.truck.model.Truck;
import lv.degra.accounting.core.user.model.User;

@Getter
@Setter
@Entity
@Audited
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "truck_user_map")
public class TruckUserMap extends AuditInfo implements Serializable {
	@Id
	@Column(name = "uid", nullable = false, length = 36)
	private String uid;

	@NotNull
	@ManyToOne(fetch = FetchType.EAGER, optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	@NotAudited
	private User user;

	@NotNull
	@ManyToOne(fetch = FetchType.EAGER, optional = false)
	@JoinColumn(name = "truck_uid", nullable = false)
	private Truck truck;

	@NotNull
	@Column(name = "is_default", nullable = false)
	private Boolean isDefault = false;

	public TruckUserMap(Truck truck, User user, boolean isDefault) {
		this.truck = truck;
		this.user = user;
		this.isDefault = isDefault;
	}

	@PrePersist
	public void generateUid() {
		if (this.uid == null) {
			this.uid = UUID.randomUUID().toString();
		}
	}

}