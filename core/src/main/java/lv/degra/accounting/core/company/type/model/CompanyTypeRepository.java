package lv.degra.accounting.core.company.type.model;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;


public interface CompanyTypeRepository extends JpaRepository<CompanyType, Integer> {

    @Query("SELECT a FROM CompanyType a WHERE a.code = :code")
    Optional<CompanyType> findByCode(@Param("code") String code);
}
