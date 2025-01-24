package lv.degra.accounting.core.account.maper;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

import lv.degra.accounting.core.account.chart.dto.AccountCodeChartDto;
import lv.degra.accounting.core.account.chart.model.AccountCodeChart;
import lv.degra.accounting.core.account.posted.dto.AccountPostedDto;
import lv.degra.accounting.core.account.posted.model.AccountPosted;
import lv.degra.accounting.core.document.dto.DocumentDto;
import lv.degra.accounting.core.document.model.Document;

@Component
public class AccountPostedMapper {

	private final ModelMapper modelMapper;

	public AccountPostedMapper(ModelMapper modelMapper) {
		this.modelMapper = modelMapper;
	}

	public AccountPostedDto toDto(AccountPosted entity) {
		AccountPostedDto dto = new AccountPostedDto();
		dto.setId(entity.getId());
		dto.setDocumentDto(modelMapper.map(entity.getDocument(), DocumentDto.class));
		dto.setDebitAccount(modelMapper.map(entity.getDebitAccount(), AccountCodeChartDto.class));
		dto.setCreditAccount(modelMapper.map(entity.getCreditAccount(), AccountCodeChartDto.class));
		return dto;
	}

	public AccountPosted toEntity(AccountPostedDto dto) {
		AccountPosted entity = new AccountPosted();
		entity.setId(dto.getId());
		entity.setDocument(modelMapper.map(dto.getDocumentDto(), Document.class));
		entity.setDebitAccount(modelMapper.map(dto.getDebitAccount(), AccountCodeChart.class));
		entity.setCreditAccount(modelMapper.map(dto.getCreditAccount(), AccountCodeChart.class));
		entity.setAmount(dto.getAmount());
		return entity;
	}
}
