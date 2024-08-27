package lv.degra.accounting.core.address.model;

import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Set;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lv.degra.accounting.core.customer.model.Customer;

@Entity
@Setter
@Getter
@Table(name = "address")
@NoArgsConstructor
public class Address implements Serializable {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false)
	private Integer id;

	private Integer code;
	private Integer type;
	private String status;
	private Integer parentCode;
	private Integer parentType;
	private String name;
	private String sortByValue;
	private String zip;
	private LocalDate dateFrom;
	private LocalDate updateDatePublic;
	private LocalDate dateTo;
	private String fullName;
	private Integer territorialUnitCode;
	private Instant createdAt;
	private Instant lastModifiedAt;

	@OneToMany(mappedBy = "address", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
	private Set<Customer> customers;

	public Address(Integer code, String name, Integer type, String status, LocalDate dateFrom) {
		this.code = code;
		this.name = name;
		this.type = type;
		this.status = status;
		this.dateFrom = dateFrom;
	}

}
