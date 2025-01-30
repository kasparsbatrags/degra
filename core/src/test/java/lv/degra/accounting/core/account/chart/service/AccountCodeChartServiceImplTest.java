package lv.degra.accounting.core.account.chart.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import lv.degra.accounting.core.account.chart.model.AccountCodeChart;
import lv.degra.accounting.core.account.chart.model.AccountCodeChartRepository;

class AccountCodeChartServiceImplTest {

	@Mock
	private AccountCodeChartRepository accountCodeChartRepository;

	@InjectMocks
	private AccountCodeChartServiceImpl accountCodeChartService;

	@BeforeEach
	void setUp() {
		MockitoAnnotations.openMocks(this);
	}

	@Test
	void testGetAccountCodeChart() {
		// Arrange
		AccountCodeChart account1 = new AccountCodeChart();
		account1.setId(1);
		account1.setCode("ACC-001");
		account1.setName("Non-Assets Account 1");
		account1.setAssetsAccount(false);

		AccountCodeChart account2 = new AccountCodeChart();
		account2.setId(2);
		account2.setCode("ACC-002");
		account2.setName("Non-Assets Account 2");
		account2.setAssetsAccount(false);

		List<AccountCodeChart> mockAccounts = List.of(account1, account2);
		when(accountCodeChartRepository.findByIsAssetsAccountFalse()).thenReturn(mockAccounts);

		// Act
		List<AccountCodeChart> result = accountCodeChartService.getAccountCodeChart();

		// Assert
		assertNotNull(result);
		assertEquals(2, result.size());
		assertEquals("ACC-001", result.get(0).getCode());
		assertEquals("ACC-002", result.get(1).getCode());
		verify(accountCodeChartRepository, times(1)).findByIsAssetsAccountFalse();
	}

	@Test
	void testGetSuggestions() {
		// Arrange
		String searchText = "Cash";
		AccountCodeChart account1 = new AccountCodeChart();
		account1.setId(3);
		account1.setCode("ACC-003");
		account1.setName("Cash Account 1");

		AccountCodeChart account2 = new AccountCodeChart();
		account2.setId(4);
		account2.setCode("ACC-004");
		account2.setName("Cash Account 2");

		List<AccountCodeChart> mockSuggestions = List.of(account1, account2);
		when(accountCodeChartRepository.getSuggestions(searchText)).thenReturn(mockSuggestions);

		// Act
		List<AccountCodeChart> result = accountCodeChartService.getSuggestions(searchText);

		// Assert
		assertNotNull(result);
		assertEquals(2, result.size());
		assertEquals("ACC-003", result.get(0).getCode());
		assertEquals("ACC-004", result.get(1).getCode());
		verify(accountCodeChartRepository, times(1)).getSuggestions(searchText);
	}
}
