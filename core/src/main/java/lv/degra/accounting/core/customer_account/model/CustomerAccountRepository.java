package lv.degra.accounting.core.customer_account.model;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CustomerAccountRepository extends JpaRepository<CustomerAccount, Integer> {
    List<CustomerAccount> getByCustomerId(Integer customerId);

    List<CustomerAccount> findByCustomerIdAndBankId(Integer customerId, Integer bankId);
}
