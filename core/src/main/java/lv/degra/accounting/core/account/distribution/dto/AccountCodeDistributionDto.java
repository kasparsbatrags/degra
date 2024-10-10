package lv.degra.accounting.core.account.distribution.dto;

import java.io.Serializable;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lv.degra.accounting.core.account.chart.model.AccountCodeChart;
import lv.degra.accounting.core.account.distribution.model.AccountCodeDistribution;
import lv.degra.accounting.core.system.object.TableViewInfo;

/**
 * DTO for {@link AccountCodeDistribution}
 */
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AccountCodeDistributionDto implements Serializable {

    private Integer id;

    @TableViewInfo(displayName = "Debeta konts", columnOrder = 1)
    private AccountCodeChart debitAccount;

	@TableViewInfo(displayName = "Summa debetā", columnOrder = 2)
    private Double amountInDebit;

	@TableViewInfo(displayName = "Kredīta konts", columnOrder = 4)
	private AccountCodeChart creditAccount;

	@TableViewInfo(displayName = "Summa kredītā", columnOrder = 3)
	private Double amountInCredit;

}