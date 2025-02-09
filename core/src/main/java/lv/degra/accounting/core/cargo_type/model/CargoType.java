package lv.degra.accounting.core.cargo_type.model;

import java.time.Instant;

import org.hibernate.envers.Audited;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Audited
@Table(name = "cargo_type")
public class CargoType {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false)
	private Integer id;

	@Size(max = 254)
	@NotNull
	@Column(name = "name", nullable = false, length = 254)
	private String name;

	@Column(name = "created_date_time")
	private Instant createdDateTime;

	@Column(name = "last_modified_date_time")
	private Instant lastModifiedDateTime;

}