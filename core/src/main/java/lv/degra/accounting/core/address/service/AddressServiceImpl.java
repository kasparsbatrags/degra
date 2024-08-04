package lv.degra.accounting.core.address.service;

import lv.degra.accounting.core.address.model.Address;
import lv.degra.accounting.core.address.model.AddressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AddressServiceImpl implements AddressService {

    @Autowired
    private AddressRepository addressRepository;

    public Address getAddress(Integer addressCode) {
        return addressRepository.getByCode(addressCode);
    }
}
