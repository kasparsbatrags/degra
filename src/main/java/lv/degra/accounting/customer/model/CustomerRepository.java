package lv.degra.accounting.customer.model;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    @Query("SELECT c FROM Customer c WHERE c.registrationNumber LIKE %:searchParam% OR c.name LIKE %:searchParam%")
    List<Customer> findByNameOrRegistrationNumber(@Param("searchParam") String searchParam);
}
