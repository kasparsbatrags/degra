package lv.degra.accounting.core.account.distribution.model;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AccountCodeDistributionRepository extends JpaRepository<AccountCodeDistribution, Integer> {

    @Query(value = "SELECT acd.* FROM account_code_distribution acd WHERE acd.document_id = :documentId", nativeQuery = true)
    List<AccountCodeDistribution> findByDocumentId(@Param("documentId") Integer documentId);

}
