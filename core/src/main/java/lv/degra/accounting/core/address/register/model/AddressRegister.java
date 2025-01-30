package lv.degra.accounting.core.address.register.model;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.Objects;

import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.fasterxml.jackson.annotation.JsonView;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lv.degra.accounting.core.address.register.view.AddressPublicView;

@Entity
@Setter
@Getter
@Table(name = "address_register")
@EntityListeners({AuditingEntityListener.class})
@NoArgsConstructor
public class AddressRegister implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;
    @JsonView({AddressPublicView.class})
    private Integer code;
    private Integer type;
    private String status;
    private Integer parentCode;
    private Integer parentType;
    private String name;
    private String sortName;
    private String zip;
    private LocalDate dateFrom;
    private LocalDate updateDatePublic;
    private LocalDate dateTo;
    @JsonView({AddressPublicView.class})
    private String fullAddress;
    private Integer territorialUnitCode;

    public AddressRegister(Integer code, String name, Integer type, String status, LocalDate dateFrom, Integer parentCode) {
        this.code = code;
        this.name = name;
        this.type = type;
        this.status = status;
        this.dateFrom = dateFrom;
        this.parentCode = parentCode;
    }

	@Override
	public String toString() {
		return "AddressRegister{" +
				"id=" + id +
				", code=" + code +
				", type=" + type +
				", status='" + status + '\'' +
				", parentCode=" + parentCode +
				", parentType=" + parentType +
				", name='" + name + '\'' +
				", sortName='" + sortName + '\'' +
				", zip='" + zip + '\'' +
				", dateFrom=" + dateFrom +
				", updateDatePublic=" + updateDatePublic +
				", dateTo=" + dateTo +
				", fullAddress='" + fullAddress + '\'' +
				", territorialUnitCode=" + territorialUnitCode +
				'}';
	}

	@Override
	public boolean equals(Object o) {
		if (o == null || getClass() != o.getClass())
			return false;
		AddressRegister that = (AddressRegister) o;
		return Objects.equals(id, that.id) && Objects.equals(code, that.code) && Objects.equals(type, that.type)
				&& Objects.equals(status, that.status) && Objects.equals(parentCode, that.parentCode)
				&& Objects.equals(parentType, that.parentType) && Objects.equals(name, that.name)
				&& Objects.equals(sortName, that.sortName) && Objects.equals(zip, that.zip) && Objects.equals(
				dateFrom, that.dateFrom) && Objects.equals(updateDatePublic, that.updateDatePublic) && Objects.equals(
				dateTo, that.dateTo) && Objects.equals(fullAddress, that.fullAddress) && Objects.equals(territorialUnitCode,
				that.territorialUnitCode);
	}

	@Override
	public int hashCode() {
		return Objects.hash(id, code, type, status, parentCode, parentType, name, sortName, zip, dateFrom, updateDatePublic, dateTo,
				fullAddress, territorialUnitCode);
	}
}
