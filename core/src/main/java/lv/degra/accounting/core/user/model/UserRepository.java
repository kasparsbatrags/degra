package lv.degra.accounting.core.user.model;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import lv.degra.accounting.core.customer.model.Customer;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
	User searchUserByCustomerAndFamilyNameAndGivenName(Customer customer, String familyName, String givenName);
}
