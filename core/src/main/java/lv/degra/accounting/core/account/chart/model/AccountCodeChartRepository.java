package lv.degra.accounting.core.account.chart.model;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface AccountCodeChartRepository extends JpaRepository<AccountCodeChart, Integer> {

    @Query("SELECT cd FROM AccountCodeChart cd WHERE cd.isAssetsAccount = false")
    List<AccountCodeChart> getNonAssets();
}
