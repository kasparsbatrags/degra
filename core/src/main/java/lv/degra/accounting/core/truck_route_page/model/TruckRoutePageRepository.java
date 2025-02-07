package lv.degra.accounting.core.truck_route_page.model;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import lv.degra.accounting.core.user.model.User;

public interface TruckRoutePageRepository extends JpaRepository<TruckRoutePage, Integer> {
	Page<TruckRoutePage> findByUser(User user, Pageable pageable);

	@Query("""
			    SELECT trp FROM TruckRoutePage trp 
			    WHERE trp.user = :user 
			    AND :routeDate BETWEEN trp.dateFrom AND COALESCE(trp.dateTo, trp.dateFrom)
			""")
	Optional<TruckRoutePage> findByUserAndRouteDate(@Param("user") User user, @Param("routeDate") LocalDate routeDate);
}