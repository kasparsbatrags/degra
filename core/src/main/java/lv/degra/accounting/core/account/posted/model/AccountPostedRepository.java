package lv.degra.accounting.core.account.posted.model;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AccountPostedRepository extends JpaRepository<AccountPosted, Integer> {

    List<AccountPosted> findByDocumentId(Integer documentId);
}
