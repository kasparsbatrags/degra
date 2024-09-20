package lv.degra.accounting.core.address.service;

import lv.degra.accounting.core.address.model.Address;

import java.util.Optional;

public interface AddressService {
    Optional<Address> findByCode(Integer addressCode);
}
