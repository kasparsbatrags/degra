package lv.degra.accounting.bank.service;

import lv.degra.accounting.bank.model.Bank;

import java.util.List;

public interface BankService {
    List<Bank> getCustomerBanksByBanksIdList(List<Integer> customerAccountList);
}
