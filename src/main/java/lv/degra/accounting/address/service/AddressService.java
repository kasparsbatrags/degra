package lv.degra.accounting.address.service;

import lv.degra.accounting.address.model.Address;

public interface AddressService {
    Address getAddress(Integer addressCode);
}
