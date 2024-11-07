package lv.degra.accounting.desktop.data;

import java.util.ArrayList;
import java.util.List;


import lv.degra.accounting.core.bank.model.Bank;
import lv.degra.accounting.core.customer.model.Customer;
import lv.degra.accounting.core.customer_account.model.CustomerAccount;

public class CustomerAccountDataFactory {

    public static final String ACCOUNT1="LV68HABA0121222222221";
    public static final String ACCOUNT2="LV68HABA0121222222222";
    public static final String ACCOUNT3="LV68HABA0121222222223";
    public static final String ACCOUNT4="LV68HABA0121222222224";
    public static final String ACCOUNT5="LV68HABA0121222222225";

    public static final CustomerAccount CUSTOMER1_BANK1_ACCOUNT1 = createCustomerBankAccount(1, CustomersData.getCustomer1(), BankModelDataFactory.ACUSTOMER_SWED_BANK, ACCOUNT1);

    public static final CustomerAccount CUSTOMER2_BANK1_ACCOUNT2 = createCustomerBankAccount(2, CustomersData.getCustomer2(), BankModelDataFactory.BCUSTOMER_SWED_BANK, ACCOUNT2);
    public static final CustomerAccount CUSTOMER2_BANK2_ACCOUNT1 = createCustomerBankAccount(2, CustomersData.getCustomer2(), BankModelDataFactory.BCUSTOMER_SEB_BANK, ACCOUNT1);

    public static final CustomerAccount CUSTOMER6_BANK1_ACCOUNT3 = createCustomerBankAccount(3, CustomersData.getCustomer6(), BankModelDataFactory.CCUSTOMER_SWED_BANK, ACCOUNT3);
    public static final CustomerAccount CUSTOMER7_BANK4_ACCOUNT4 = createCustomerBankAccount(4, CustomersData.getCustomer6(), BankModelDataFactory.FCUSTOMER_RIKO_BANK, ACCOUNT4);
    public static final CustomerAccount CUSTOMER6_BANK1_ACCOUNT5 = createCustomerBankAccount(5, CustomersData.getCustomer6(), BankModelDataFactory.CCUSTOMER_SWED_BANK, ACCOUNT5);

    private static CustomerAccount createCustomerBankAccount(int id, Customer customer, Bank bank, String account) {
        CustomerAccount cba = new CustomerAccount();
        cba.setId(id);
        cba.setCustomer(customer);
        cba.setBank(bank);
        cba.setAccount(account);
        return cba;
    }


    public static List<CustomerAccount> getCustomer1AccountList() {
        List<CustomerAccount> customerAccountList = new ArrayList<>();
        customerAccountList.add(CUSTOMER1_BANK1_ACCOUNT1);
        return customerAccountList;
    }

    public static List<CustomerAccount> getCustomer2AccountList() {
        List<CustomerAccount> customerAccountList = new ArrayList<>();
        customerAccountList.add(CUSTOMER2_BANK1_ACCOUNT2);
        customerAccountList.add(CUSTOMER2_BANK2_ACCOUNT1);
        return customerAccountList;
    }

    public static List<CustomerAccount> getCustomer6AccountList() {
        List<CustomerAccount> customerAccountList = new ArrayList<>();
        customerAccountList.add(CUSTOMER6_BANK1_ACCOUNT3);
        customerAccountList.add(CUSTOMER7_BANK4_ACCOUNT4);
        customerAccountList.add(CUSTOMER6_BANK1_ACCOUNT5);
        return customerAccountList;
    }

}
