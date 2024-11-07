package lv.degra.accounting.core.bank.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lv.degra.accounting.core.bank.model.Bank;
import lv.degra.accounting.core.bank.model.BankRepository;

@Service
public class BankServiceImpl implements BankService {

	private final BankRepository bankRepository;

	@Autowired
	public BankServiceImpl(BankRepository bankRepository) {
		this.bankRepository = bankRepository;
	}

	public List<Bank> getCustomerBanksByBanksIdList(List<Integer> bankIdList) {
		return bankRepository.findByIdIn(bankIdList);
	}
}
