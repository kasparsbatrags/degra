package lv.degra.accounting.core.account.distribution.service;

import java.util.List;

import lv.degra.accounting.core.account.distribution.dto.AccountCodeDistributionDto;
import lv.degra.accounting.core.account.distribution.model.AccountCodeDistribution;
import lv.degra.accounting.core.document.dto.DocumentDto;

public interface AccountCodeDistributionService {
	List<AccountCodeDistributionDto> getDistributionByDocumentId(Integer documentId);
}
