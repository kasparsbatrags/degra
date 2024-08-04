package lv.degra.accounting.desktop.data;

import lv.degra.accounting.core.bank.model.Bank;

import java.util.ArrayList;
import java.util.List;

import static lv.degra.accounting.desktop.data.CustomersData.*;

public class BankDataFactory {

    public static String BANK1_BIC = "HABALV22";
    public static final Bank CUSTOMER1_BANK1 = new Bank(1, getCustomer1(), BANK1_BIC);
    public static final Bank CUSTOMER2_BANK1 = new Bank(1, getCustomer2(), BANK1_BIC);
    public static final Bank CUSTOMER3_BANK1 = new Bank(1, getCustomer3(), BANK1_BIC);
    public static final Bank CUSTOMER6_BANK1 = new Bank(1, getCustomer3(), BANK1_BIC);
    public static String BANK2_BIC = "UNLALV2X";
    public static final Bank CUSTOMER2_BANK2 = new Bank(2, getCustomer2(), BANK2_BIC);
    public static final Bank CUSTOMER4_BANK2 = new Bank(2, getCustomer4(), BANK2_BIC);
    public static String BANK3_BIC = "PARXLV22";
    public static final Bank CUSTOMER5_BANK3 = new Bank(3, getCustomer5(), BANK3_BIC);
    public static String BANK4_BIC = "RIKOLV2X";
    public static final Bank CUSTOMER6_BANK4 = new Bank(1, getCustomer6(), BANK4_BIC);
    public static final Bank CUSTOMER7_BANK4 = new Bank(4, getCustomer7(), BANK4_BIC);


    public static List<Integer> getUniqueCustomer1BankIdList() {
        List<Integer> result = new ArrayList<>();
        result.add(CUSTOMER3_BANK1.getId());
        return result;
    }

    public static List<Integer> getUniqueCustomer2BankIdList() {
        List<Integer> result = new ArrayList<>();
        result.add(CUSTOMER2_BANK1.getId());
        result.add(CUSTOMER2_BANK2.getId());
        return result;
    }


    public static List<Bank> getCustomer1BankList() {
        return List.of(new Bank(CUSTOMER1_BANK1.getId(), CUSTOMER1_BANK1.getCustomer(), CUSTOMER1_BANK1.getBic()));
    }

    public static List<Bank> getCustomer2BankList() {
        List<Bank> result = new ArrayList<>();
        result.add(new Bank(CUSTOMER2_BANK1.getId(), CUSTOMER2_BANK1.getCustomer(), CUSTOMER2_BANK1.getBic()));
        result.add(new Bank(CUSTOMER2_BANK2.getId(), CUSTOMER2_BANK2.getCustomer(), CUSTOMER2_BANK2.getBic()));
        return result;
    }

}
