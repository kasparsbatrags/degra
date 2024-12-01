package lv.degra.accounting.core.account.posted;

import static lv.degra.accounting.core.document.dataFactories.DocumentDataFactory.createValidDocument;

import lv.degra.accounting.core.account.chart.model.AccountCodeChart;
import lv.degra.accounting.core.account.posted.model.AccountPosted;

public class AccountPostedDataFactory {

	public static AccountPosted createValidAccountPosted() {
		AccountPosted accountPosted = new AccountPosted();
		accountPosted.setId(1);
		accountPosted.setDocument(createValidDocument()); // Assume valid Document instance
		accountPosted.setDebitAccount(new AccountCodeChart(1, "DEBIT001", "Debit Account", true, true, null, 0.0, null));
		accountPosted.setCreditAccount(new AccountCodeChart(2, "CREDIT001", "Credit Account", true, false, null, 0.0, null));
		accountPosted.setAmount(1000.00);
		return accountPosted;
	}

	public static AccountPosted createAccountPostedWithNullDocument() {
		AccountPosted accountPosted = createValidAccountPosted();
		accountPosted.setDocument(null); // Invalid: document is required
		return accountPosted;
	}

	public static AccountPosted createAccountPostedWithNegativeAmount() {
		AccountPosted accountPosted = createValidAccountPosted();
		accountPosted.setAmount(-500.00); // Invalid: negative amount
		return accountPosted;
	}

	public static AccountPosted createAccountPostedWithNullDebitAccount() {
		AccountPosted accountPosted = createValidAccountPosted();
		accountPosted.setDebitAccount(null); // Invalid: debit account is required
		return accountPosted;
	}

	public static AccountPosted createAccountPostedWithNullCreditAccount() {
		AccountPosted accountPosted = createValidAccountPosted();
		accountPosted.setCreditAccount(null); // Invalid: credit account is required
		return accountPosted;
	}
}
