package lv.degra.accounting.core.address.register.service;

import lv.degra.accounting.core.address.register.model.AddressRegister;

import java.util.List;

public interface AddressRegisterService {
    void importData();
    List<AddressRegister> getByMultipleWords(String searchString);
}
