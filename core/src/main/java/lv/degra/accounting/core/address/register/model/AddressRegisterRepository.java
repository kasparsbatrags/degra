package lv.degra.accounting.core.address.register.model;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AddressRegisterRepository extends JpaRepository<AddressRegister, Integer> {
	@Query(value = "SELECT a FROM AddressRegister a WHERE a.code=:addressCode")
    AddressRegister getByCode(@Param("addressCode") Integer addressCode);
}
