package lv.degra.accounting.core.bank.service;

import static lv.degra.accounting.core.bank.BankModelDataFactory.ACUSTOMER_SWED_BANK;
import static lv.degra.accounting.core.bank.BankModelDataFactory.BCUSTOMER_SWED_BANK;
import static org.mockito.Mockito.when;
import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import lv.degra.accounting.core.bank.model.Bank;
import lv.degra.accounting.core.bank.model.BankRepository;

class BankServiceImplTest {

	@Mock
	private BankRepository bankRepository;

	@InjectMocks
	private BankServiceImpl bankService;

	@BeforeEach
	void setUp() {
		MockitoAnnotations.openMocks(this);
	}

	@Test
	void testGetCustomerBanksByBanksIdList() {
		List<Integer> bankIdList = Arrays.asList(1, 2);

		List<Bank> expectedBanks = Arrays.asList(ACUSTOMER_SWED_BANK, BCUSTOMER_SWED_BANK);
		when(bankRepository.findByIdIn(bankIdList)).thenReturn(expectedBanks);

		List<Bank> actualBanks = bankService.getCustomerBanksByBanksIdList(bankIdList);
		assertEquals(expectedBanks, actualBanks);
	}
}
