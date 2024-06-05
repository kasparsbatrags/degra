package lv.degra.accounting.customer.model;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    @Query("SELECT c FROM Customer c WHERE lower(c.name) LIKE lower(concat('%', :searchTerm, '%')) OR c.registrationNumber LIKE :searchTerm ORDER BY c.name ASC LIMIT 30")
    List<Customer> getTop30Suggestions(@Param("searchTerm") String searchTerm);

    @Query("SELECT c FROM Customer c WHERE c.registrationNumber = :registrationNumber AND c.name = :name")
    Customer getByNameAndRegistrationNumber(@Param("name") String name, @Param("registrationNumber") String registrationNumber);
}
