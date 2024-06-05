package lv.degra.accounting.data;

import lv.degra.accounting.address.model.Address;
import lv.degra.accounting.bank.model.Bank;
import lv.degra.accounting.customer.model.Customer;
import lv.degra.accounting.customer.model.CustomerType;
import lv.degra.accounting.customer_account.model.CustomerAccount;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class CustomerDataFactory {

    public static Customer createCustomer(int id, String name, CustomerType customerType, String regNumber, String vatNumber, Address address) {
        Customer customer = new Customer();
        customer.setId(id);
        customer.setName(name);
        customer.setCustomerType(customerType);
        customer.setRegistrationNumber(regNumber);
        customer.setVatNumber(vatNumber);
        customer.setAddress(address);
        return customer;
    }

    public static Bank createBank(int id, Customer customer, String bic) {
        Bank bank = new Bank();
        bank.setId(id);
        bank.setCustomer(customer);
        bank.setBic(bic);
        return bank;
    }

    public static CustomerAccount createCustomerBankAccount(int id, Bank bank, String account) {
        CustomerAccount cba = new CustomerAccount();
        cba.setId(id);
        cba.setBank(bank);
        cba.setAccount(account);
        return cba;
    }

    public static CustomerType createCustomerType(int id, String name) {
        CustomerType customerType = new CustomerType();
        customerType.setId(id);
        customerType.setName(name);
        return customerType;

    }

    public static Address createAddress(Integer id, Integer code, Integer type, String status, Integer parentCode, Integer parentType, String name, String sortByValue, String zip, LocalDate dateFrom, LocalDate updateDatePublic, LocalDate dateTo, String fullName, Integer territorialUnitCode, Instant createdAt, Instant lastModifiedAt) {
        Address address = new Address();
        address.setId(id);
        address.setCode(code);
        address.setType(type);
        address.setStatus(status);
        address.setParentCode(parentCode);
        address.setParentType(parentType);
        address.setName(name);
        address.setSortByValue(sortByValue);
        address.setZip(zip);
        address.setDateFrom(dateFrom);
        address.setUpdateDatePublic(updateDatePublic);
        address.setDateTo(dateTo);
        address.setFullName(fullName);
        address.setTerritorialUnitCode(territorialUnitCode);
        address.setCreatedAt(createdAt);
        address.setLastModifiedAt(lastModifiedAt);
        return address;
    }

    public static List<Customer> getCustomer1List() {
        List<Customer> customerList = new ArrayList<>();
        customerList.add(CustomersData.getCustomer1());
        return customerList;
    }

    public static List<Customer> getCustomer2List() {
        List<Customer> customerList = new ArrayList<>();
        customerList.add(CustomersData.getCustomer2());
        return customerList;
    }

}
