package lv.degra.accounting.core.account.chart.dto;

import static lv.degra.accounting.core.currency.CurrencyDataFactory.getEurCurrency;
import static lv.degra.accounting.core.currency.CurrencyDataFactory.getUsdCurrency;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import lv.degra.accounting.core.currency.model.Currency;

public class AccountCodeChartDtoTest {

	private AccountCodeChartDto accountCodeChartDto;

	@BeforeEach
	public void setUp() {
		accountCodeChartDto = new AccountCodeChartDto();
	}

	@Test
	public void testGettersAndSetters() {
		// Set values
		Integer id = 1;
		String code = "ACC-001";
		String name = "Cash Account";
		boolean isAssetsAccount = true;
		boolean useForBilance = false;
		Currency currency = getUsdCurrency();
		AccountCodeChartDto parentAccount = new AccountCodeChartDto(2, "ACC-002", "Parent Account", false, true, null, null);

		accountCodeChartDto.setId(id);
		accountCodeChartDto.setCode(code);
		accountCodeChartDto.setName(name);
		accountCodeChartDto.setAssetsAccount(isAssetsAccount);
		accountCodeChartDto.setUseForBilance(useForBilance);
		accountCodeChartDto.setCurrency(currency);
		accountCodeChartDto.setParentAccount(parentAccount);

		// Verify getters
		assertEquals(id, accountCodeChartDto.getId());
		assertEquals(code, accountCodeChartDto.getCode());
		assertEquals(name, accountCodeChartDto.getName());
		assertEquals(isAssetsAccount, accountCodeChartDto.isAssetsAccount());
		assertEquals(useForBilance, accountCodeChartDto.isUseForBilance());
		assertEquals(currency, accountCodeChartDto.getCurrency());
		assertEquals(parentAccount, accountCodeChartDto.getParentAccount());
	}

	@Test
	public void testConstructorAllArgs() {
		Currency currency = getEurCurrency();
		AccountCodeChartDto parentAccount = new AccountCodeChartDto(3, "ACC-003", "Main Account", false, true, currency, null);
		AccountCodeChartDto dto = new AccountCodeChartDto(4, "ACC-004", "Child Account", true, false, currency, parentAccount);

		assertNotNull(dto);
		assertEquals(4, dto.getId());
		assertEquals("ACC-004", dto.getCode());
		assertEquals("Child Account", dto.getName());
		assertTrue(dto.isAssetsAccount());
		assertFalse(dto.isUseForBilance());
		assertEquals(currency, dto.getCurrency());
		assertEquals(parentAccount, dto.getParentAccount());
	}

	@Test
	public void testNoArgsConstructor() {
		assertNotNull(accountCodeChartDto);
		assertNull(accountCodeChartDto.getId());
		assertNull(accountCodeChartDto.getCode());
		assertNull(accountCodeChartDto.getName());
		assertFalse(accountCodeChartDto.isAssetsAccount());
		assertFalse(accountCodeChartDto.isUseForBilance());
		assertNull(accountCodeChartDto.getCurrency());
		assertNull(accountCodeChartDto.getParentAccount());
	}

	@Test
	public void testParentAccountRelationship() {
		AccountCodeChartDto parentAccount = new AccountCodeChartDto(5, "ACC-005", "Parent Account", false, true, null, null);
		accountCodeChartDto.setParentAccount(parentAccount);

		assertEquals(parentAccount, accountCodeChartDto.getParentAccount());
		assertEquals("Parent Account", accountCodeChartDto.getParentAccount().getName());
	}
}
