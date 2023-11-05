package lv.degra.accounting.bank.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import lv.degra.accounting.customer.model.Customer;
import lv.degra.accounting.customerAccount.model.CustomerBankAccount;

import java.io.Serializable;
import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "bank")
public class Bank implements Serializable {
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

    @OneToMany(mappedBy = "bank")
    private Set<CustomerBankAccount> customerBankAccounts = new LinkedHashSet<>();

    @Override
    public String toString() {
        return customer.getName();
    }
}