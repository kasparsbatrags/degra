package lv.degra.accounting.core.account.chart.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lv.degra.accounting.core.currency.model.Currency;
import lv.degra.accounting.core.system.object.TableViewInfo;

import java.io.Serializable;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AccountCodeChartDto implements Serializable {

    private Integer id;
    @TableViewInfo(displayName = "Konts", columnOrder = 1)
    private String code;
    private String name;
    private boolean isAssetsAccount;
    private boolean useForBilance;
    private Currency currency;
    private AccountCodeChartDto parentAccount;
}
