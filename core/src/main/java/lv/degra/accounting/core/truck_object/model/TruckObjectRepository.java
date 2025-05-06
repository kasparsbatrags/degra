package lv.degra.accounting.core.truck_object.model;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface TruckObjectRepository extends JpaRepository<TruckObject, Integer> {

	boolean existsByNameIgnoreCase(String name);

	@Query(value = """
            SELECT t.* FROM truck_object t 
            WHERE 
            (
                to_tsvector('simple', t.name) @@ plainto_tsquery('simple', :name) 
                OR similarity(t.name, :name) > 0.4
            )
            ORDER BY similarity(t.name, :name) DESC, t.name ASC 
            LIMIT 5
            """, nativeQuery = true)
	List<TruckObject> findSimilarByName(String name);
}
