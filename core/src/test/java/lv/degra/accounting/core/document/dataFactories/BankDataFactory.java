package lv.degra.accounting.core.document.dataFactories;

import java.util.ArrayList;
import java.util.List;

import lv.degra.accounting.core.bank.model.Bank;

public class BankDataFactory {

    public static final String SWED_BANK_BIC = "HABALV22";
    public static final Bank ACUSTOMER_SWED_BANK = new Bank(1, CustomersData.getCustomer1(), SWED_BANK_BIC);
    public static final Bank BCUSTOMER_SWED_BANK = new Bank(1, CustomersData.getCustomer2(), SWED_BANK_BIC);
    public static final Bank CCUSTOMER_SWED_BANK = new Bank(1, CustomersData.getCustomer3(), SWED_BANK_BIC);
    public static final String SEB_BANK_BIC = "UNLALV2X";
    public static final Bank BCUSTOMER_SEB_BANK = new Bank(2, CustomersData.getCustomer2(), SEB_BANK_BIC);
    public static final String RIKO_BANK_BIC = "RIKOLV2X";
    public static final Bank FCUSTOMER_RIKO_BANK = new Bank(1, CustomersData.getCustomer6(), RIKO_BANK_BIC);


    public static List<Integer> getUniqueCustomer1BankIdList() {
        List<Integer> result = new ArrayList<>();
        result.add(CCUSTOMER_SWED_BANK.getId());
        return result;
    }

    public static List<Integer> getUniqueCustomer2BankIdList() {
        List<Integer> result = new ArrayList<>();
        result.add(BCUSTOMER_SWED_BANK.getId());
        result.add(BCUSTOMER_SEB_BANK.getId());
        return result;
    }


    public static List<Bank> getCustomer1BankList() {
        return List.of(new Bank(ACUSTOMER_SWED_BANK.getId(), ACUSTOMER_SWED_BANK.getCustomer(), ACUSTOMER_SWED_BANK.getBic()));
    }

    public static List<Bank> getCustomer2BankList() {
        List<Bank> result = new ArrayList<>();
        result.add(new Bank(BCUSTOMER_SWED_BANK.getId(), BCUSTOMER_SWED_BANK.getCustomer(), BCUSTOMER_SWED_BANK.getBic()));
        result.add(new Bank(BCUSTOMER_SEB_BANK.getId(), BCUSTOMER_SEB_BANK.getCustomer(), BCUSTOMER_SEB_BANK.getBic()));
        return result;
    }

}
