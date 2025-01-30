package lv.degra.accounting.core.bank.model;

import java.io.Serializable;
import java.util.Objects;

import org.hibernate.envers.Audited;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lv.degra.accounting.core.auditor.model.AuditInfo;
import lv.degra.accounting.core.customer.model.Customer;

@Getter
@Setter
@Entity
@Table(name = "bank")
@AllArgsConstructor
@NoArgsConstructor
@Audited
public class Bank extends AuditInfo implements Serializable {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false)
	private Integer id;

	@NotNull
	@ManyToOne(fetch = FetchType.EAGER, optional = false)
	@JoinColumn(name = "customer_id", nullable = false)
	private Customer customer;

	@Size(max = 11)
	@NotNull
	@Column(name = "bic", nullable = false, length = 11)
	private String bic;

	@Override
	public String toString() {
		return customer.getName();
	}

	@Override
	public boolean equals(Object o) {
		if (this == o)
			return true;
		if (o == null || getClass() != o.getClass())
			return false;
		Bank bank = (Bank) o;
		return Objects.equals(id, bank.id);
	}

	@Override
	public int hashCode() {
		return Objects.hash(id);
	}
}