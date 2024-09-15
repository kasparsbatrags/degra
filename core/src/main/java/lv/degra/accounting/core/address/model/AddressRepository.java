package lv.degra.accounting.core.address.model;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AddressRepository extends JpaRepository<Address, Integer> {
	@Query(value = "SELECT a FROM AddressRegister a WHERE a.code=:addressCode")
	Address getByCode(@Param("addressCode") Integer addressCode);
}
