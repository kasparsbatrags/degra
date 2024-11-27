package lv.degra.accounting.core.account.chart;

import static lv.degra.accounting.core.currency.CurrencyDataFactory.getDefaultCurrency;

import lv.degra.accounting.core.account.chart.model.AccountCodeChart;

public class AccountCodeChartDataFactory {

	public static AccountCodeChart createValidAccountCodeChart() {
		AccountCodeChart account = new AccountCodeChart();
		account.setId(1);
		account.setCode("AC123");
		account.setName("Valid Account");
		account.setAssetsAccount(true);
		account.setUseForBilance(false);
		account.setCurrency(getDefaultCurrency());
		account.setAmountInAccount(1000.0);
		account.setParentAccount(null); // No parent for this example
		return account;
	}

	public static AccountCodeChart createAccountCodeChartWithNullCode() {
		AccountCodeChart account = createValidAccountCodeChart();
		account.setCode(null); // Invalid
		return account;
	}

	public static AccountCodeChart createAccountCodeChartWithLongName() {
		AccountCodeChart account = createValidAccountCodeChart();
		account.setName("This is an invalid name because it exceeds the maximum length of 80 characters");
		return account;
	}

	public static AccountCodeChart createAccountCodeChartWithNegativeAmount() {
		AccountCodeChart account = createValidAccountCodeChart();
		account.setAmountInAccount(-500.0); // Example with negative amount
		return account;
	}

	public static AccountCodeChart createAccountCodeChartWithParent() {
		AccountCodeChart parentAccount = createValidAccountCodeChart();
		parentAccount.setId(2);
		parentAccount.setCode("PARENT1");

		AccountCodeChart childAccount = createValidAccountCodeChart();
		childAccount.setParentAccount(parentAccount);

		return childAccount;
	}

	public static AccountCodeChart createDebitAccount() {
		AccountCodeChart account = createValidAccountCodeChart();
		account.setCode("DEBIT1");
		return account;
	}

	public static AccountCodeChart createCreditAccount() {
		AccountCodeChart account = createValidAccountCodeChart();
		account.setCode("CREDIT1");
		return account;
	}
}

