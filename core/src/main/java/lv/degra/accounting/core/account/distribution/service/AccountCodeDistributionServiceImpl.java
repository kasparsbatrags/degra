package lv.degra.accounting.core.account.distribution.service;

import java.util.List;

import lv.degra.accounting.core.account.distribution.dto.AccountCodeDistributionDto;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lv.degra.accounting.core.account.distribution.model.AccountCodeDistributionRepository;

@Service
public class AccountCodeDistributionServiceImpl implements AccountCodeDistributionService{

	private final AccountCodeDistributionRepository accountCodeDistributionRepository;
	private final ModelMapper modelMapper;

	@Autowired
	public AccountCodeDistributionServiceImpl(AccountCodeDistributionRepository accountCodeDistributionRepository, ModelMapper modelMapper) {
		this.accountCodeDistributionRepository = accountCodeDistributionRepository;
        this.modelMapper = modelMapper;
    }

	public List<AccountCodeDistributionDto> getDistributionByDocumentId(Integer documentId) {
		return accountCodeDistributionRepository.findByDocumentId(documentId).stream()
		.map(distribution -> modelMapper.map(distribution, AccountCodeDistributionDto.class)).toList();
	}
}
