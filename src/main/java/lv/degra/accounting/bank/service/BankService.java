package lv.degra.accounting.bank.service;

import javafx.collections.ObservableList;
import lv.degra.accounting.bank.model.Bank;

import java.util.List;

public interface BankService {
    ObservableList<Bank> getCustomerBanksByBanksIdList(List<Integer> customerAccountList);
}
