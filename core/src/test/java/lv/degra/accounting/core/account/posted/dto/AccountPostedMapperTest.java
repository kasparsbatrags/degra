package lv.degra.accounting.core.account.posted.dto;

import static lv.degra.accounting.core.account.chart.dto.AccountCodeChartDtoDataFactory.createAccountCodeChartDtoDebitAccount;
import static lv.degra.accounting.core.account.chart.model.AccountCodeChartDataFactory.createCreditAccount;
import static lv.degra.accounting.core.account.chart.model.AccountCodeChartDataFactory.createDebitAccount;
import static lv.degra.accounting.core.document.dto.DocumentDtoDataFactory.createValidDocumentDto;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.modelmapper.ModelMapper;

import lv.degra.accounting.core.account.chart.dto.AccountCodeChartDto;
import lv.degra.accounting.core.account.chart.model.AccountCodeChart;
import lv.degra.accounting.core.account.maper.AccountPostedMapper;
import lv.degra.accounting.core.account.posted.model.AccountPosted;
import lv.degra.accounting.core.document.dto.DocumentDto;
import lv.degra.accounting.core.document.model.Document;

class AccountPostedMapperTest {

	private AccountPostedMapper accountPostedMapper;
	private ModelMapper modelMapper;

	@BeforeEach
	void setUp() {
		modelMapper = mock(ModelMapper.class);
		accountPostedMapper = new AccountPostedMapper(modelMapper);
	}

	@Test
	void testToDto() {

		AccountPosted entity = new AccountPosted();
		entity.setId(1);
		Document document = new Document();
		entity.setDocument(document);
		AccountCodeChart debitAccount = createDebitAccount();
		AccountCodeChart creditAccount = createCreditAccount();
		entity.setDebitAccount(debitAccount);
		entity.setCreditAccount(creditAccount);

		DocumentDto documentDto = createValidDocumentDto();
		AccountCodeChartDto debitAccountDto = createAccountCodeChartDtoDebitAccount();
		AccountCodeChartDto creditAccountDto = createAccountCodeChartDtoDebitAccount();
		when(modelMapper.map(document, DocumentDto.class)).thenReturn(documentDto);
		when(modelMapper.map(debitAccount, AccountCodeChartDto.class)).thenReturn(debitAccountDto);
		when(modelMapper.map(creditAccount, AccountCodeChartDto.class)).thenReturn(creditAccountDto);

		AccountPostedDto dto = accountPostedMapper.toDto(entity);

		assertNotNull(dto, "DTO should not be null");
		assertEquals(entity.getId(), dto.getId(), "ID should match");
		assertEquals(documentDto, dto.getDocumentDto(), "DocumentDto should match");
		assertEquals(debitAccountDto, dto.getDebitAccount(), "DebitAccountDto should match");
		assertEquals(creditAccountDto, dto.getCreditAccount(), "CreditAccountDto should match");
	}

	@Test
	void testToEntity() {
		// Sagatavo DTO
		AccountPostedDto dto = new AccountPostedDto();
		dto.setId(1);
		DocumentDto documentDto = new DocumentDto();
		dto.setDocumentDto(documentDto);
		AccountCodeChartDto debitAccountDto = new AccountCodeChartDto();
		AccountCodeChartDto creditAccountDto = new AccountCodeChartDto();
		dto.setDebitAccount(debitAccountDto);
		dto.setCreditAccount(creditAccountDto);

		// Mockē `ModelMapper` kartēšanu
		Document document = new Document();
		AccountCodeChart debitAccount = new AccountCodeChart();
		AccountCodeChart creditAccount = new AccountCodeChart();
		when(modelMapper.map(documentDto, Document.class)).thenReturn(document);
		when(modelMapper.map(debitAccountDto, AccountCodeChart.class)).thenReturn(debitAccount);
		when(modelMapper.map(creditAccountDto, AccountCodeChart.class)).thenReturn(creditAccount);

		// Izsauc `toEntity` metodi
		AccountPosted entity = accountPostedMapper.toEntity(dto);

		// Pārbaudes
		assertNotNull(entity, "Entity should not be null");
		assertEquals(dto.getId(), entity.getId(), "ID should match");
		assertEquals(document, entity.getDocument(), "Document should match");
		assertEquals(debitAccount, entity.getDebitAccount(), "DebitAccount should match");
		assertEquals(creditAccount, entity.getCreditAccount(), "CreditAccount should match");
	}
}
