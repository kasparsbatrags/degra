package lv.degra.accounting.core.truck_route.model;




import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import lv.degra.accounting.core.user.model.User;

public interface TruckRouteRepository extends JpaRepository<TruckRoute, Integer> {
	Page<TruckRoute> findByUser(User user, Pageable pageable);
}