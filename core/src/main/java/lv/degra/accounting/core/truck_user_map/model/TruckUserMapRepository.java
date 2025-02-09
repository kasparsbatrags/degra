package lv.degra.accounting.core.truck_user_map.model;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import lv.degra.accounting.core.user.model.User;

public interface TruckUserMapRepository extends JpaRepository<TruckUserMap, Integer> {
	List<TruckUserMap> findByUser(User user);
}