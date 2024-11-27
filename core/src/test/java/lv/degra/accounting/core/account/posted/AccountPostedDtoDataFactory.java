package lv.degra.accounting.core.account.posted;

import static lv.degra.accounting.core.account.chart.AccountCodeChartDataFactory.createCreditAccount;
import static lv.degra.accounting.core.account.chart.AccountCodeChartDataFactory.createDebitAccount;
import static lv.degra.accounting.core.document.dto.DocumentDtoDataFactory.createValidDocumentDto;

import lv.degra.accounting.core.account.posted.dto.AccountPostedDto;

public class AccountPostedDtoDataFactory {

	public static AccountPostedDto createValidAccountPostedDto() {
		AccountPostedDto dto = new AccountPostedDto();
		dto.setId(1);
		dto.setDocumentDto(createValidDocumentDto());
		dto.setDebitAccount(createDebitAccount());
		dto.setCreditAccount(createCreditAccount());
		dto.setAmount(1000.00);
		return dto;
	}

	public static AccountPostedDto createAccountPostedDtoWithNullDebitAccount() {
		AccountPostedDto dto = createValidAccountPostedDto();
		dto.setDebitAccount(null); // Invalid
		return dto;
	}

	public static AccountPostedDto createAccountPostedDtoWithNegativeAmount() {
		AccountPostedDto dto = createValidAccountPostedDto();
		dto.setAmount(-500.00); // Invalid
		return dto;
	}

	public static AccountPostedDto createAccountPostedDtoWithNullDocumentDto() {
		AccountPostedDto dto = createValidAccountPostedDto();
		dto.setDocumentDto(null); // Invalid
		return dto;
	}
}
