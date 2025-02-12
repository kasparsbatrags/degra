package lv.degra.accounting.core.truck_route.model;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TruckRouteRepository extends JpaRepository<TruckRoute, Integer> {
	@Query("""
        SELECT tr FROM TruckRoute tr
        WHERE tr.truckRoutePage.user.id = :userId
            ORDER BY tr.routeDate DESC
    """)
	Page<TruckRoute> findByUserId(@Param("userId") Integer userId, Pageable pageable);
}