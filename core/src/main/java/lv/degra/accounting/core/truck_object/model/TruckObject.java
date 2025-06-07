package lv.degra.accounting.core.truck_object.model;

import java.io.Serializable;

import org.hibernate.envers.Audited;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import lv.degra.accounting.core.auditor.model.AuditInfo;

@Getter
@Setter
@Entity
@Audited
@Table(name = "truck_object")
public class TruckObject extends AuditInfo implements Serializable {
	@Id
	@Column(name = "uid", nullable = false, length = 36)
	private String uid;

	@Size(max = 100)
	@Column(name = "name", length = 100)
	private String name;

	@PrePersist
	public void generateUid() {
		if (this.uid == null) {
			this.uid = java.util.UUID.randomUUID().toString();
		}
	}
}