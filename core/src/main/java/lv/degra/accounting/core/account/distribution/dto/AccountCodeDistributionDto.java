package lv.degra.accounting.core.account.distribution.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lv.degra.accounting.core.account.chart.model.AccountCodeChart;
import lv.degra.accounting.core.document.model.Document;
import lv.degra.accounting.core.system.object.TableViewInfo;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AccountCodeDistributionDto implements Serializable {

    private Integer id;
//    private Document document;
//    @TableViewInfo(displayName = "Konts debetā", columnOrder = 1)
//    private AccountCodeChart debitAccount;
//    private Double amountInDebit;
//    private AccountCodeChart creditAccount;
    @TableViewInfo(displayName = "Konts kredītā", columnOrder = 1)
    private Double amountInCredit;

}