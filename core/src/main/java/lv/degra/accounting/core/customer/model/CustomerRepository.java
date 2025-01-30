package lv.degra.accounting.core.customer.model;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    @Query("SELECT c FROM Customer c WHERE lower(c.name) LIKE lower(concat('%', :searchTerm, '%')) OR c.registrationNumber LIKE :searchTerm ORDER BY c.name ASC")
    List<Customer> getTopSuggestions(@Param("searchTerm") String searchTerm, Pageable pageable);

    @Query("SELECT c FROM Customer c WHERE c.registrationNumber = :registrationNumber AND c.name = :name")
    Customer getByNameAndRegistrationNumber(@Param("name") String name, @Param("registrationNumber") String registrationNumber);

	Customer getByRegistrationNumber(String registrationNumber);
}
