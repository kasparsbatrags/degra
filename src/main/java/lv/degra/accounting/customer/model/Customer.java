package lv.degra.accounting.customer.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

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
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_type_id", nullable = false)
    private CustomerType customerType;

    @Size(max = 15)
    @NotNull
    @Column(name = "registration_number", nullable = false, length = 15)
    private String registrationNumber;

    @Size(max = 15)
    @Column(name = "vat_number", length = 15)
    private String vatNumber;

    @NotNull
    @Column(name = "address_id", nullable = false)
    private Integer addressId;


    @Override
    public String toString() {
        return name + ' ' + registrationNumber;
    }
}