package lv.degra.accounting.core.customer_account.model;

import java.io.Serializable;

import org.hibernate.envers.Audited;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import lv.degra.accounting.core.auditor.model.AuditInfo;
import lv.degra.accounting.core.bank.model.Bank;
import lv.degra.accounting.core.customer.model.Customer;

@Getter
@Setter
@Entity
@Table(name = "customer_account")
@Audited
public class CustomerAccount extends AuditInfo implements Serializable {
	@Id
	@Column(name = "id", nullable = false)
	private Integer id;

	@NotNull
	@ManyToOne(fetch = FetchType.EAGER, optional = false)
	@JoinColumn(name = "bank_id", nullable = false)
	private Bank bank;

	@NotNull
	@ManyToOne(fetch = FetchType.EAGER, optional = false)
	@JoinColumn(name = "customer_id", nullable = false)
	private Customer customer;

	@Size(max = 21)
	@NotNull
	@Column(name = "account", nullable = false, length = 21)
	private String account;

	@Override
	public String toString() {
		return account;
	}

}