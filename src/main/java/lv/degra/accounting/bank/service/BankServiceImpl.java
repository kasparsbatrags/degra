package lv.degra.accounting.bank.service;

import lombok.AllArgsConstructor;
import lv.degra.accounting.bank.model.Bank;
import lv.degra.accounting.bank.model.BankRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class BankServiceImpl implements BankService {

    @Autowired
    private BankRepository bankRepository;

    public List<Bank> getCustomerBanksByBanksIdList(List<Integer> bankIdList) {
        return bankRepository.findByBankIdList(bankIdList);
    }
}
