package lv.degra.accounting.core.user.model;

import java.io.Serializable;
import java.util.List;

import org.hibernate.envers.Audited;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import lv.degra.accounting.core.auditor.model.AuditInfo;
import lv.degra.accounting.core.customer.model.Customer;
import lv.degra.accounting.core.useremailaddress.model.UserEmailAddress;

@Getter
@Setter
@Entity
@Table(name = "\"user\"")
@Audited
public class User extends AuditInfo implements Serializable {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false)
	private Integer id;

	@Size(max = 50)
	@NotNull
	@Column(name = "given_name", nullable = false, length = 50)
	private String givenName;

	@Size(max = 50)
	@NotNull
	@Column(name = "family_name", nullable = false, length = 50)
	private String familyName;

	@NotNull
	@OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
	private List<UserEmailAddress> userEmailAddress;

	@NotNull
	@ManyToOne(fetch = FetchType.EAGER, optional = false)
	@JoinColumn(name = "customer_id", nullable = false)
	private Customer customer;
}
