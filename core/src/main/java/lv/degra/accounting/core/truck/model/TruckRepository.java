package lv.degra.accounting.core.truck.model;

import org.springframework.data.jpa.repository.JpaRepository;

import lv.degra.accounting.core.user.model.User;

public interface TruckRepository extends JpaRepository<Truck, Long> {
	Truck findByUser(User user);
}
