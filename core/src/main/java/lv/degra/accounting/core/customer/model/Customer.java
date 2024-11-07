package lv.degra.accounting.core.customer.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import lv.degra.accounting.core.address.model.Address;

import java.io.Serializable;
import java.util.Objects;

@Getter
@Setter
@Entity
@Table(name = "customer")
public class Customer implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Size(max = 250)
    @NotNull
    @Column(name = "name", nullable = false, length = 250)
    private String name;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "customer_type_id", nullable = false)
    private CustomerType customerType;

    @Size(max = 15)
    @NotNull
    @Column(name = "registration_number", nullable = false, length = 15)
    private String registrationNumber;

    @Size(max = 15)
    @Column(name = "vat_number", length = 15)
    private String vatNumber;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "address_code", referencedColumnName = "code")
    private Address address;

    @Override
    public String toString() {
        return name + ' ' + registrationNumber;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Customer customer = (Customer) o;
        return Objects.equals(id, customer.id);
    }

    //
    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}