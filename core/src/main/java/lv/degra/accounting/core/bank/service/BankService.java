package lv.degra.accounting.core.bank.service;

import lv.degra.accounting.core.bank.model.Bank;

import java.util.List;

public interface BankService {
    List<Bank> getCustomerBanksByBanksIdList(List<Integer> customerAccountList);
}
