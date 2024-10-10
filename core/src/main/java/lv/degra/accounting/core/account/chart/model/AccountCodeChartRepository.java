package lv.degra.accounting.core.account.chart.model;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface AccountCodeChartRepository extends JpaRepository<AccountCodeChart, Integer> {

    @Query("select a from AccountCodeChart a where a.isAssetsAccount = false")
    List<AccountCodeChart> findByIsAssetsAccountFalse();

	@Query("SELECT COUNT(a) FROM AccountCodeChart a WHERE a.isAssetsAccount = false")
	long countByIsAssetsAccountFalse();

}
