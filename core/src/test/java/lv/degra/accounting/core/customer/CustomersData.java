package lv.degra.accounting.core.customer;

import lv.degra.accounting.core.address.AddressStaticData;
import lv.degra.accounting.core.customer.model.Customer;



public class CustomersData {

    public static Customer getCustomer1() {
        return CustomerModelDataFactory.createCustomer(
                CustomersStaticData.CUSTOMER1_ID,
                CustomersStaticData.CUSTOMER1_NAME,
                CustomerModelDataFactory.createCustomerType(CustomerTypeStaticData.CUSTOMER_TYPE_LEGAL_PERSON_ID, CustomerTypeStaticData.CUSTOMER_TYPE_LEGAL_PERSON),
                CustomersStaticData.CUSTOMER1_REGISTRATION_NUMBER,
                CustomersStaticData.CUSTOMER1_VAT_NUMBER,
                AddressStaticData.ADDRESS1);
    }
    public static Customer getCustomer2() {
        return CustomerModelDataFactory.createCustomer(
                CustomersStaticData.CUSTOMER2_ID,
                CustomersStaticData.CUSTOMER2_NAME,
                CustomerModelDataFactory.createCustomerType(CustomerTypeStaticData.CUSTOMER_TYPE_LEGAL_PERSON_ID, CustomerTypeStaticData.CUSTOMER_TYPE_LEGAL_PERSON),
                CustomersStaticData.CUSTOMER2_REGISTRATION_NUMBER,
                CustomersStaticData.CUSTOMER2_VAT_NUMBER,
                AddressStaticData.ADDRESS2);
    }
    public static Customer getCustomer3() {
        return CustomerModelDataFactory.createCustomer(
                CustomersStaticData.CUSTOMER3_ID,
                CustomersStaticData.CUSTOMER3_NAME,
                CustomerModelDataFactory.createCustomerType(CustomerTypeStaticData.CUSTOMER_TYPE_LEGAL_PERSON_ID, CustomerTypeStaticData.CUSTOMER_TYPE_LEGAL_PERSON),
                CustomersStaticData.CUSTOMER3_REGISTRATION_NUMBER,
                CustomersStaticData.CUSTOMER3_VAT_NUMBER,
                AddressStaticData.ADDRESS3);
    }

    public static Customer getCustomer4() {
        return CustomerModelDataFactory.createCustomer(
                CustomersStaticData.CUSTOMER4_ID,
                CustomersStaticData.CUSTOMER4_NAME,
                CustomerModelDataFactory.createCustomerType(CustomerTypeStaticData.CUSTOMER_TYPE_LEGAL_PERSON_ID, CustomerTypeStaticData.CUSTOMER_TYPE_LEGAL_PERSON),
                CustomersStaticData.CUSTOMER4_REGISTRATION_NUMBER,
                CustomersStaticData.CUSTOMER4_VAT_NUMBER,
                AddressStaticData.ADDRESS4);
    }

    public static Customer getCustomer5() {
        return CustomerModelDataFactory.createCustomer(
                CustomersStaticData.CUSTOMER5_ID,
                CustomersStaticData.CUSTOMER5_NAME,
                CustomerModelDataFactory.createCustomerType(CustomerTypeStaticData.CUSTOMER_TYPE_LEGAL_PERSON_ID, CustomerTypeStaticData.CUSTOMER_TYPE_LEGAL_PERSON),
                CustomersStaticData.CUSTOMER5_REGISTRATION_NUMBER,
                CustomersStaticData.CUSTOMER5_VAT_NUMBER,
                AddressStaticData.ADDRESS5);
    }

    public static Customer getCustomer6() {
        return CustomerModelDataFactory.createCustomer(
                CustomersStaticData.CUSTOMER6_ID,
                CustomersStaticData.CUSTOMER6_NAME,
                CustomerModelDataFactory.createCustomerType(CustomerTypeStaticData.CUSTOMER_TYPE_LEGAL_PERSON_ID, CustomerTypeStaticData.CUSTOMER_TYPE_LEGAL_PERSON),
                CustomersStaticData.CUSTOMER6_REGISTRATION_NUMBER,
                CustomersStaticData.CUSTOMER6_VAT_NUMBER,
                AddressStaticData.ADDRESS6);
    }

    public static Customer getCustomer7() {
        return CustomerModelDataFactory.createCustomer(
                CustomersStaticData.CUSTOMER7_ID,
                CustomersStaticData.CUSTOMER7_NAME,
                CustomerModelDataFactory.createCustomerType(CustomerTypeStaticData.CUSTOMER_TYPE_LEGAL_PERSON_ID, CustomerTypeStaticData.CUSTOMER_TYPE_LEGAL_PERSON),
                CustomersStaticData.CUSTOMER7_REGISTRATION_NUMBER,
                CustomersStaticData.CUSTOMER7_VAT_NUMBER,
                AddressStaticData.ADDRESS7);
    }



}
