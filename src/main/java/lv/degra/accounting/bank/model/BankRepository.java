package lv.degra.accounting.bank.model;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface BankRepository extends JpaRepository<Bank, Integer> {
    @Query(value = "SELECT b.* FROM bank b WHERE b.id in :bankIdList", nativeQuery = true)
    List<Bank> findByBankIdList(List<Integer> bankIdList);


}
