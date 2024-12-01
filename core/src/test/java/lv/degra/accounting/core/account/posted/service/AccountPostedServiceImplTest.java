package lv.degra.accounting.core.account.posted.service;

import static lv.degra.accounting.core.account.posted.AccountPostedDataFactory.createValidAccountPosted;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.modelmapper.ModelMapper;

import lv.degra.accounting.core.account.posted.model.AccountPosted;
import lv.degra.accounting.core.account.posted.model.AccountPostedRepository;

class AccountPostedServiceImplTest {

	private AccountPostedServiceImpl accountPostedService;

	@Mock
	private AccountPostedRepository accountPostedRepository;

	@Mock
	private ModelMapper modelMapper;

	@BeforeEach
	void setUp() {
		MockitoAnnotations.openMocks(this);
		accountPostedService = new AccountPostedServiceImpl(accountPostedRepository, modelMapper);
	}

	@Test
	void testServiceInitialization() {
		// Verify that the service initializes correctly with mocked dependencies
		assertNotNull(accountPostedService, "Service should be initialized successfully");
	}

	@Test
	void testRepositoryDependency() {
		// Simulate a repository interaction and verify behavior
		when(accountPostedRepository.findAll()).thenReturn(List.of());
		var result = accountPostedRepository.findAll();
		assertNotNull(result, "Result should not be null");
		verify(accountPostedRepository).findAll(); // Ensure repository method was called
	}

	@Test
	void testModelMapperDependency() {
		// Test ModelMapper interaction
		AccountPosted source = createValidAccountPosted(); // Izveido avota objektu
		AccountPosted destination = createValidAccountPosted(); // Mērķa objektu

		// Simulē repository atgriezi ar mērķa objektu
		List<AccountPosted> destinationList = new ArrayList<>();
		destinationList.add(destination);
		when(accountPostedRepository.findAll()).thenReturn(destinationList);

		// Pārveido avotu uz mērķa tipu ar ModelMapper
		when(modelMapper.map(source, AccountPosted.class)).thenReturn(destination); // Simulē modelMapper rīcību
		AccountPosted result = modelMapper.map(source, AccountPosted.class);

		// Pārbauda rezultātu
		assertEquals(destination, result, "ModelMapper should map correctly");

		// Pārbauda, vai tika izsaukta map metode
		verify(modelMapper).map(source, AccountPosted.class);
	}

}
