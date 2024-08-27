package lv.degra.accounting.core.account.distribution.model;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import lv.degra.accounting.core.document.model.Document;

public interface AccountCodeDistributionRepository extends JpaRepository<AccountCodeDistribution, Integer> {

	List<AccountCodeDistribution> findByDocument(Document document);
}
