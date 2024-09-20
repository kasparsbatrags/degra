package lv.degra.accounting.core.customer_account.model;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CustomerAccountRepository extends JpaRepository<CustomerAccount, Integer> {
    List<CustomerAccount> getByCustomerId(Integer customerId);
    List<CustomerAccount> findByCustomerIdAndBankId(Integer customerId,Integer bankId);
}
