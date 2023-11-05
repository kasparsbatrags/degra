package lv.degra.accounting.customerAccount.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import lv.degra.accounting.bank.model.Bank;

import java.io.Serializable;

@Getter
@Setter
@Entity
@Table(name = "customer_account")
public class CustomerBankAccount implements Serializable {
    @Id
    @Column(name = "id", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "bank_id", nullable = false)
    private Bank bank;

    @Size(max = 21)
    @NotNull
    @Column(name = "account", nullable = false, length = 21)
    private String account;

    @Override
    public String toString() {
        return account;
    }
}