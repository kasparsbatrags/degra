package lv.degra.accounting.customer_account.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import lv.degra.accounting.bank.model.Bank;
import lv.degra.accounting.customer.model.Customer;

import java.io.Serializable;

@Getter
@Setter
@Entity
@Table(name = "customer_account")
public class CustomerAccount implements Serializable {
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