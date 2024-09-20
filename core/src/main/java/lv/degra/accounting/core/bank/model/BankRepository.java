package lv.degra.accounting.core.bank.model;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BankRepository extends JpaRepository<Bank, Integer> {
    List<Bank> findByIdIn(List<Integer> bankIdList);
}
