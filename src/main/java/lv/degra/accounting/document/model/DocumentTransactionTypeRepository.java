package lv.degra.accounting.document.model;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DocumentTransactionTypeRepository extends JpaRepository<DocumentTransactionType, Long> {
    @Query("SELECT d FROM DocumentTransactionType d WHERE d.id=:id")
    Document getById(@Param("id") Integer id);
}
