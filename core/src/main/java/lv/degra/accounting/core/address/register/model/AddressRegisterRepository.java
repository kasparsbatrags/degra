package lv.degra.accounting.core.address.register.model;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AddressRegisterRepository extends JpaRepository<AddressRegister, Integer>, CustomAddressRegisterSearchRepository {
    List<AddressRegister> searchByMultipleWords(String searchString);
}
