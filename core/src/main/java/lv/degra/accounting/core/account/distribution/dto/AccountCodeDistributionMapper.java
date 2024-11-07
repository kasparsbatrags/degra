package lv.degra.accounting.core.account.distribution.dto;

import org.springframework.stereotype.Component;

import lv.degra.accounting.core.account.distribution.model.AccountCodeDistribution;

@Component
public class AccountCodeDistributionMapper {

	public AccountCodeDistributionDto toDto(AccountCodeDistribution entity) {
		AccountCodeDistributionDto dto = new AccountCodeDistributionDto();
		dto.setId(entity.getId());
		dto.setDocument(entity.getDocument());
		dto.setDebitAccount(entity.getDebitAccount());
		dto.setCreditAccount(entity.getCreditAccount());
		return dto;
	}

	public AccountCodeDistribution toEntity(AccountCodeDistributionDto dto) {
		AccountCodeDistribution entity = new AccountCodeDistribution();
		entity.setId(dto.getId());
		entity.setDocument(dto.getDocument());
		entity.setDebitAccount(dto.getDebitAccount());
		entity.setCreditAccount(dto.getCreditAccount());
		entity.setAmount(dto.getAmount());
		return entity;
	}
}
