package lv.degra.accounting.data;

import lv.degra.accounting.customer.model.Customer;

import static lv.degra.accounting.data.AddressStaticData.*;

public class CustomersData {

    public static Customer getCustomer1() {
        return CustomerDataFactory.createCustomer(
                CustomersStaticData.CUSTOMER1_ID,
                CustomersStaticData.CUSTOMER1_NAME,
                CustomerDataFactory.createCustomerType(CustomerTypeStaticData.CUSTOMER_TYPE_LEGAL_PERSON_ID, CustomerTypeStaticData.CUSTOMER_TYPE_LEGAL_PERSON),
                CustomersStaticData.CUSTOMER1_REGISTRATION_NUMBER,
                CustomersStaticData.CUSTOMER1_VAT_NUMBER,
                ADDRESS1);
    }
    public static Customer getCustomer2() {
        return CustomerDataFactory.createCustomer(
                CustomersStaticData.CUSTOMER2_ID,
                CustomersStaticData.CUSTOMER2_NAME,
                CustomerDataFactory.createCustomerType(CustomerTypeStaticData.CUSTOMER_TYPE_LEGAL_PERSON_ID, CustomerTypeStaticData.CUSTOMER_TYPE_LEGAL_PERSON),
                CustomersStaticData.CUSTOMER2_REGISTRATION_NUMBER,
                CustomersStaticData.CUSTOMER2_VAT_NUMBER,
                ADDRESS2);
    }
    public static Customer getCustomer3() {
        return CustomerDataFactory.createCustomer(
                CustomersStaticData.CUSTOMER3_ID,
                CustomersStaticData.CUSTOMER3_NAME,
                CustomerDataFactory.createCustomerType(CustomerTypeStaticData.CUSTOMER_TYPE_LEGAL_PERSON_ID, CustomerTypeStaticData.CUSTOMER_TYPE_LEGAL_PERSON),
                CustomersStaticData.CUSTOMER3_REGISTRATION_NUMBER,
                CustomersStaticData.CUSTOMER3_VAT_NUMBER,
                ADDRESS3);
    }

    public static Customer getCustomer4() {
        return CustomerDataFactory.createCustomer(
                CustomersStaticData.CUSTOMER4_ID,
                CustomersStaticData.CUSTOMER4_NAME,
                CustomerDataFactory.createCustomerType(CustomerTypeStaticData.CUSTOMER_TYPE_LEGAL_PERSON_ID, CustomerTypeStaticData.CUSTOMER_TYPE_LEGAL_PERSON),
                CustomersStaticData.CUSTOMER4_REGISTRATION_NUMBER,
                CustomersStaticData.CUSTOMER4_VAT_NUMBER,
                ADDRESS4);
    }

    public static Customer getCustomer5() {
        return CustomerDataFactory.createCustomer(
                CustomersStaticData.CUSTOMER5_ID,
                CustomersStaticData.CUSTOMER5_NAME,
                CustomerDataFactory.createCustomerType(CustomerTypeStaticData.CUSTOMER_TYPE_LEGAL_PERSON_ID, CustomerTypeStaticData.CUSTOMER_TYPE_LEGAL_PERSON),
                CustomersStaticData.CUSTOMER5_REGISTRATION_NUMBER,
                CustomersStaticData.CUSTOMER5_VAT_NUMBER,
                ADDRESS5);
    }

    public static Customer getCustomer6() {
        return CustomerDataFactory.createCustomer(
                CustomersStaticData.CUSTOMER6_ID,
                CustomersStaticData.CUSTOMER6_NAME,
                CustomerDataFactory.createCustomerType(CustomerTypeStaticData.CUSTOMER_TYPE_LEGAL_PERSON_ID, CustomerTypeStaticData.CUSTOMER_TYPE_LEGAL_PERSON),
                CustomersStaticData.CUSTOMER6_REGISTRATION_NUMBER,
                CustomersStaticData.CUSTOMER6_VAT_NUMBER,
                ADDRESS6);
    }

    public static Customer getCustomer7() {
        return CustomerDataFactory.createCustomer(
                CustomersStaticData.CUSTOMER7_ID,
                CustomersStaticData.CUSTOMER7_NAME,
                CustomerDataFactory.createCustomerType(CustomerTypeStaticData.CUSTOMER_TYPE_LEGAL_PERSON_ID, CustomerTypeStaticData.CUSTOMER_TYPE_LEGAL_PERSON),
                CustomersStaticData.CUSTOMER7_REGISTRATION_NUMBER,
                CustomersStaticData.CUSTOMER7_VAT_NUMBER,
                ADDRESS7);
    }



}
