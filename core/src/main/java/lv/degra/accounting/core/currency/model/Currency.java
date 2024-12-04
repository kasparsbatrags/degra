package lv.degra.accounting.core.currency.model;

import java.io.Serializable;
import java.util.Objects;

import org.hibernate.envers.Audited;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import lv.degra.accounting.core.auditor.model.AuditInfo;

@Getter
@Setter
@Entity
@Table(name = "currency")
@Audited
public class Currency extends AuditInfo implements Serializable {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false)
	private Integer id;

	@Size(min = 3, max = 3)
	@Column(name = "code", length = 3)
	private String code;

	@Column(name = "name", length = 100)
	private String name;

	@Column(name = "subunit_name", length = 100)
	private String subunitName;

	@Override
	public String toString() {
		return getCode();
	}

	@Override
	public boolean equals(Object o) {
		if (o == null || getClass() != o.getClass())
			return false;
		Currency currency = (Currency) o;
		return Objects.equals(id, currency.id) && Objects.equals(code, currency.code) && Objects.equals(name, currency.name)
				&& Objects.equals(subunitName, currency.subunitName);
	}

	@Override
	public int hashCode() {
		return Objects.hash(id, code, name, subunitName);
	}
}