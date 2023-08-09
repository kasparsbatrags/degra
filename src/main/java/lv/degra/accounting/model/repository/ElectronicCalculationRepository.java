package lv.degra.accounting.model.repository;

import lv.degra.accounting.model.domain.ElectronicCalculation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ElectronicCalculationRepository extends JpaRepository<ElectronicCalculation, Long> {
}
