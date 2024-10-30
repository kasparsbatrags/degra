package lv.degra.accounting.core.account.distribution.dto;

import java.io.Serializable;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lv.degra.accounting.core.account.chart.model.AccountCodeChart;
import lv.degra.accounting.core.account.chart.service.AccountCodeChartService;
import lv.degra.accounting.core.account.distribution.model.AccountCodeDistribution;
import lv.degra.accounting.core.document.model.Document;
import lv.degra.accounting.core.system.component.TableViewInfo;

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

	@TableViewInfo(displayName = "Debeta konts", columnOrder = 1, columnWidth = 400, useAsSearchComboBox = true,
			searchServiceClass = AccountCodeChartService.class)
	private AccountCodeChart debitAccount;

	private Document document;

	@TableViewInfo(displayName = "Summa debetā", columnOrder = 2, columnWidth = 200, editable = true)
	private Double amountInDebit;

	@TableViewInfo(displayName = "Summa kredītā", columnOrder = 3, columnWidth = 200, editable = true)
	private Double amountInCredit;

	@TableViewInfo(displayName = "Kredīta konts", columnOrder = 4, columnWidth = 400, useAsSearchComboBox = true,
			searchServiceClass = AccountCodeChartService.class)
	private AccountCodeChart creditAccount;

}