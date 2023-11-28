package lv.degra.accounting.document.bill.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "unit_type")
public class UnitType {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false)
	private Integer id;

	@Size(max = 5)
	@Column(name = "code", length = 5)
	private String code;

	@Size(max = 30)
	@Column(name = "name", length = 30)
	private String name;

	@Override
	public String toString() {
		return getCode();
	}
}
