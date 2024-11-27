package lv.degra.accounting.core.account.posted.dto;

import java.io.Serializable;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lv.degra.accounting.core.account.chart.model.AccountCodeChart;
import lv.degra.accounting.core.account.chart.service.AccountCodeChartService;
import lv.degra.accounting.core.account.posted.model.AccountPosted;
import lv.degra.accounting.core.document.dto.DocumentDto;
import lv.degra.accounting.core.system.component.TableViewInfo;

/**
 * DTO for {@link AccountPosted}
 */
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AccountPostedDto implements Serializable {

	private Integer id;

	@NotNull
	private DocumentDto documentDto;

	@TableViewInfo(displayName = "Debeta konts", columnOrder = 1, columnWidth = 500, useAsSearchComboBox = true,
			searchServiceClass = AccountCodeChartService.class, editable = true, styleClass = "")
	@NotNull
	private AccountCodeChart debitAccount;

	@TableViewInfo(displayName = "Kredīta konts", columnOrder = 2, columnWidth = 500, useAsSearchComboBox = true,
			searchServiceClass = AccountCodeChartService.class, editable = true)
	@NotNull
	private AccountCodeChart creditAccount;

	@TableViewInfo(displayName = "Summa", columnOrder = 3, columnWidth = 200, editable = true, styleClass = "sum-column")
	@NotNull
	@PositiveOrZero(message = "Summai jābūt pozitīvai vai 0")
	private Double amount;

}