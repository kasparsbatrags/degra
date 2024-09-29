package lv.degra.accounting.core.account.distribution.service;

import java.util.List;

import lv.degra.accounting.core.account.distribution.dto.AccountCodeDistributionDto;

public interface DistributionService {
	List<AccountCodeDistributionDto> getDistributionByDocumentId(Integer documentId);
}
