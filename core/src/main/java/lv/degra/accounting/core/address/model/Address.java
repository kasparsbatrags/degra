package lv.degra.accounting.core.address.model;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.Objects;
import java.util.Set;

import org.hibernate.envers.Audited;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lv.degra.accounting.core.auditor.AuditorRevisionListener;
import lv.degra.accounting.core.auditor.model.AuditInfo;
import lv.degra.accounting.core.customer.model.Customer;

@Entity
@Setter
@Getter
@Table(name = "address")
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditorRevisionListener.class)
@Audited
public class Address extends AuditInfo implements Serializable {
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
    @Column(name = "full_name")
    private String fullAddress;
    private Integer territorialUnitCode;

    @OneToMany(mappedBy = "address", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private Set<Customer> customers;

    public Address(Integer code, String name, Integer type, String status, LocalDate dateFrom) {
        this.code = code;
        this.name = name;
        this.type = type;
        this.status = status;
        this.dateFrom = dateFrom;
    }

	@Override
	public boolean equals(Object o) {
		if (o == null || getClass() != o.getClass())
			return false;
		Address address = (Address) o;
		return Objects.equals(id, address.id) && Objects.equals(code, address.code) && Objects.equals(type,
				address.type) && Objects.equals(status, address.status) && Objects.equals(parentCode, address.parentCode)
				&& Objects.equals(parentType, address.parentType) && Objects.equals(name, address.name)
				&& Objects.equals(sortByValue, address.sortByValue) && Objects.equals(zip, address.zip)
				&& Objects.equals(dateFrom, address.dateFrom) && Objects.equals(updateDatePublic, address.updateDatePublic)
				&& Objects.equals(dateTo, address.dateTo) && Objects.equals(fullAddress, address.fullAddress)
				&& Objects.equals(territorialUnitCode, address.territorialUnitCode) && Objects.equals(customers,
				address.customers);
	}

	@Override
	public int hashCode() {
		return Objects.hash(id, code, type, status, parentCode, parentType, name, sortByValue, zip, dateFrom, updateDatePublic, dateTo,
				fullAddress, territorialUnitCode, customers);
	}
}
