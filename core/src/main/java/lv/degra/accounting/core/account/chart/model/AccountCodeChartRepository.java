package lv.degra.accounting.core.account.chart.model;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AccountCodeChartRepository extends JpaRepository<AccountCodeChart, Integer> {

    List<AccountCodeChart> getByIsAssetsAccountFalse();
}
