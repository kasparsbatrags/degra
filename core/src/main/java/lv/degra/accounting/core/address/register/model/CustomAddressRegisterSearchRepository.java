package lv.degra.accounting.core.address.register.model;

import java.util.List;

public interface CustomAddressRegisterSearchRepository {
    List<AddressRegister> searchByMultipleWords(String searchString);
}
