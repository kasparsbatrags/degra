package lv.degra.accounting.core.truck_route_page.model;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import lv.degra.accounting.core.user.model.User;

public interface TruckRoutePageRepository extends JpaRepository<TruckRoutePage, Integer> {
	Page<TruckRoutePage> findByUser(User user, Pageable pageable);
}