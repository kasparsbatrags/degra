package lv.degra.accounting.core.address.register.model;

import lv.degra.accounting.core.address.model.Address;

import java.util.List;

public interface CustomAddressRegisterSearchRepository {
    List<AddressRegister> searchByMultipleWords(String searchString);
}
