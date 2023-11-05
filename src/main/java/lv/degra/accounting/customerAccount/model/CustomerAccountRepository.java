package lv.degra.accounting.customerAccount.model;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CustomerAccountRepository extends JpaRepository<CustomerBankAccount, Integer> {
    @Query(value = "SELECT a.* FROM customer_account a WHERE customer_id = :customerId", nativeQuery = true)
    List<CustomerBankAccount> findByCustomer(@Param("customerId") Integer customerId);

    @Query(value = "SELECT a.* FROM customer_account a WHERE customer_id = :customerId AND bank_id= :bankId", nativeQuery = true)
    List<CustomerBankAccount> findByCustomerAndBank(@Param("customerId") Integer customerId, @Param("bankId") Integer bankId);

}
