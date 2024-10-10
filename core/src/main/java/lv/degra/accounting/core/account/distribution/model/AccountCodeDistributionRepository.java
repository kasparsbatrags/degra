package lv.degra.accounting.core.account.distribution.model;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AccountCodeDistributionRepository extends JpaRepository<AccountCodeDistribution, Integer> {

    List<AccountCodeDistribution> findByDocumentId(Integer documentId);
}
