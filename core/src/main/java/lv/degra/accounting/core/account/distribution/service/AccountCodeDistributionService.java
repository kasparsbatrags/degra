package lv.degra.accounting.core.account.distribution.service;

import java.util.List;

import lv.degra.accounting.core.account.distribution.model.AccountCodeDistribution;
import lv.degra.accounting.core.document.model.Document;

public interface AccountCodeDistributionService {
	List<AccountCodeDistribution> getDistributionByDocument(Document document);
}
