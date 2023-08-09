package lv.degra.accounting.model.repository;

import lv.degra.accounting.model.domain.ElectronicComponent;
import lv.degra.accounting.model.domain.ElectronicComponentType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ElectronicComponentRepository extends JpaRepository<ElectronicComponent, Long> {
    Optional<ElectronicComponent> findByValueAndType(Double value, ElectronicComponentType type);
}
