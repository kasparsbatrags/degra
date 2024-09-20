package lv.degra.accounting.core.company.type.model;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;


public interface CompanyTypeRepository extends JpaRepository<CompanyType, Integer> {

    Optional<CompanyType> getByCode(String code);
}
