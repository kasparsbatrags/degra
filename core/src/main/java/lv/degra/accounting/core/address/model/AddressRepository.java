package lv.degra.accounting.core.address.model;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AddressRepository extends JpaRepository<Address, Integer> {
    Optional<Address> findByCode(Integer addressCode);

}

