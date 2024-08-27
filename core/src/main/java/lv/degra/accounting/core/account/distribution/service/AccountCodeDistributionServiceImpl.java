package lv.degra.accounting.core.account.distribution.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lv.degra.accounting.core.account.distribution.model.AccountCodeDistribution;
import lv.degra.accounting.core.account.distribution.model.AccountCodeDistributionRepository;
import lv.degra.accounting.core.document.model.Document;

@Service
public class AccountCodeDistributionServiceImpl implements AccountCodeDistributionService{

	private final AccountCodeDistributionRepository accountCodeDistributionRepository;

	@Autowired
	public AccountCodeDistributionServiceImpl(AccountCodeDistributionRepository accountCodeDistributionRepository) {
		this.accountCodeDistributionRepository = accountCodeDistributionRepository;
	}

	public List<AccountCodeDistribution> getDistributionByDocument(Document document) {
		return accountCodeDistributionRepository.findByDocument(document);
	}
}
