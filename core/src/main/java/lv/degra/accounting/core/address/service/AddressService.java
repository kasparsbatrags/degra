package lv.degra.accounting.core.address.service;

import lv.degra.accounting.core.address.model.Address;

public interface AddressService {
    Address getAddress(Integer addressCode);
}
