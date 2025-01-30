package lv.degra.accounting.core.account.chart.dto;

import static lv.degra.accounting.core.currency.CurrencyDataFactory.getDefaultCurrency;

public class AccountCodeChartDtoDataFactory {

	public static AccountCodeChartDto createValidAccountCodeChartDto() {
		AccountCodeChartDto accountCodeChartDto = new AccountCodeChartDto();
		accountCodeChartDto.setId(1);
		accountCodeChartDto.setCode("ACC001");
		accountCodeChartDto.setName("Assets");
		accountCodeChartDto.setAssetsAccount(true);
		accountCodeChartDto.setUseForBilance(true);
		accountCodeChartDto.setCurrency(getDefaultCurrency());
		accountCodeChartDto.setParentAccount(createParentAccount());
		return accountCodeChartDto;
	}

	public static AccountCodeChartDto createParentAccount() {
		AccountCodeChartDto parentAccount = new AccountCodeChartDto();
		parentAccount.setId(2);
		parentAccount.setCode("PARENT_ACC");
		parentAccount.setName("Parent Account");
		parentAccount.setAssetsAccount(false);
		parentAccount.setUseForBilance(false);
		parentAccount.setCurrency(getDefaultCurrency());
		return parentAccount;
	}

	public static AccountCodeChartDto createAccountCodeChartDtoDebitAccount() {
		AccountCodeChartDto account = createValidAccountCodeChartDto();
		account.setCode("DEBIT1");
		return account;
	}

	public static AccountCodeChartDto createAccountCodeChartDtoCreditAccount() {
		AccountCodeChartDto account = createValidAccountCodeChartDto();
		account.setCode("CREDIT1");
		return account;
	}

}
