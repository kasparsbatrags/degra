package lv.degra.accounting.core.account.chart.model;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AccountCodeChartRepository extends JpaRepository<AccountCodeChart, Integer> {

	@Query("SELECT a FROM AccountCodeChart a WHERE a.isAssetsAccount = false")
	List<AccountCodeChart> findByIsAssetsAccountFalse();

	@Query("SELECT COUNT(a) FROM AccountCodeChart a WHERE a.isAssetsAccount = false")
	long countByIsAssetsAccountFalse();

	@Query(value = """
			WITH max_parent_ids AS (
			    SELECT MAX(parent_id) AS max_parent_id
			    FROM account_code_chart
			    GROUP BY parent_id
			    HAVING parent_id IS NOT NULL
			)
			SELECT * FROM account_code_chart acc
			WHERE acc.parent_id IN (SELECT max_parent_id FROM max_parent_ids)
			  AND NOT EXISTS (
			      SELECT 1 FROM account_code_chart child
			      WHERE child.parent_id = acc.id
			  )
			AND (
			    LOWER(acc.code) LIKE lower(concat('%', :searchTerm, '%'))
				OR LOWER(acc.name) LIKE lower(concat('%', :searchTerm, '%'))
			) ORDER BY acc.code ASC
			""", nativeQuery = true)
	List<AccountCodeChart> getSuggestions(@Param("searchTerm") String searchTerm);

}
