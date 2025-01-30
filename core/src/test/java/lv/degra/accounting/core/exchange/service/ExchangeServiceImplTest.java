package lv.degra.accounting.core.exchange.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.time.LocalDate;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import lv.degra.accounting.core.currency.model.Currency;
import lv.degra.accounting.core.currency.service.CurrencyService;
import lv.degra.accounting.core.exchange.model.CurrencyExchangeRate;
import lv.degra.accounting.core.exchange.model.CurrencyExchangeRateRepository;

class ExchangeServiceImplTest {

	@Mock
	private CurrencyExchangeRateRepository currencyExchangeRateRepository;

	@Mock
	private CurrencyService currencyService;

	private ExchangeServiceImpl exchangeService;

	@BeforeEach
	void setUp() {
		MockitoAnnotations.openMocks(this);
		exchangeService = new ExchangeServiceImpl(currencyExchangeRateRepository, currencyService);
	}

	@Test
	void testGetActuallyExchangeRate_WithExistingCurrency() {
		LocalDate date = LocalDate.of(2024, 12, 1);
		Currency currency = mock(Currency.class);
		when(currency.getId()).thenReturn(1);
		CurrencyExchangeRate expectedRate = new CurrencyExchangeRate();
		when(currencyExchangeRateRepository.getByRateDateAndCurrency(date, currency.getId())).thenReturn(expectedRate);

		CurrencyExchangeRate result = exchangeService.getActuallyExchangeRate(date, currency);

		assertEquals(expectedRate, result);
		verify(currencyExchangeRateRepository).getByRateDateAndCurrency(date, currency.getId());
		verifyNoInteractions(currencyService);
	}

	@Test
	void testGetActuallyExchangeRate_WithNullCurrency() {
		LocalDate date = LocalDate.of(2024, 12, 1);
		Currency defaultCurrency = mock(Currency.class);
		when(defaultCurrency.getId()).thenReturn(2);
		when(currencyService.getDefaultCurrency()).thenReturn(defaultCurrency);
		CurrencyExchangeRate expectedRate = new CurrencyExchangeRate();
		when(currencyExchangeRateRepository.getByRateDateAndCurrency(date, defaultCurrency.getId())).thenReturn(expectedRate);

		CurrencyExchangeRate result = exchangeService.getActuallyExchangeRate(date, null);

		assertEquals(expectedRate, result);
		verify(currencyService).getDefaultCurrency();
		verify(currencyExchangeRateRepository).getByRateDateAndCurrency(date, defaultCurrency.getId());
	}

	@Test
	void testGetActuallyExchangeRate_WithNullExchangeRate() {
		LocalDate date = LocalDate.of(2024, 12, 1);

		// Simulējam primāro valūtu
		Currency currency = mock(Currency.class);
		when(currency.getId()).thenReturn(1);
		when(currencyExchangeRateRepository.getByRateDateAndCurrency(date, currency.getId())).thenReturn(null);

		// Simulējam noklusēto valūtu
		Currency defaultCurrency = mock(Currency.class);
		when(defaultCurrency.getId()).thenReturn(1);
		when(currencyService.getDefaultCurrency()).thenReturn(defaultCurrency);

		// Simulējam noklusēto maiņas kursu
		CurrencyExchangeRate defaultRate = mock(CurrencyExchangeRate.class);
		when(currencyExchangeRateRepository.getByRateDateAndCurrency(date, defaultCurrency.getId())).thenReturn(defaultRate);

		// Simulējam `getDefaultCurrencyExchangeRate()`
		when(exchangeService.getDefaultCurrencyExchangeRate()).thenReturn(defaultRate);

		// Izsauc metodi
		CurrencyExchangeRate result = exchangeService.getActuallyExchangeRate(date, currency);

		// Validē rezultātu
		assertEquals(defaultRate, result, "Expected fallback to default exchange rate");

		// Pārbauda metodes izsaukumus
		verify(currencyExchangeRateRepository).getByRateDateAndCurrency(date, currency.getId());
		verify(currencyExchangeRateRepository).getByRateDateAndCurrency(date, defaultCurrency.getId());
	}




	@Test
	void testGetDefaultCurrencyExchangeRate() {
		LocalDate today = LocalDate.now();
		Currency defaultCurrency = mock(Currency.class);
		when(defaultCurrency.getId()).thenReturn(2);
		when(currencyService.getDefaultCurrency()).thenReturn(defaultCurrency);
		CurrencyExchangeRate expectedRate = new CurrencyExchangeRate();
		when(currencyExchangeRateRepository.getByRateDateAndCurrency(today, defaultCurrency.getId())).thenReturn(expectedRate);

		CurrencyExchangeRate result = exchangeService.getDefaultCurrencyExchangeRate();

		assertEquals(expectedRate, result);
		verify(currencyService).getDefaultCurrency();
		verify(currencyExchangeRateRepository).getByRateDateAndCurrency(today, defaultCurrency.getId());
	}
}
