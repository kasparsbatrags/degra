package lv.degra.accounting.core.account.distribution.model;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AccountCodeDistributionRepository extends JpaRepository<AccountCodeDistribution, Integer> {

    List<AccountCodeDistribution> getByDocumentId(Integer documentId);
}
