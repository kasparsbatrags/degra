package lv.degra.accounting.address.service;

import lv.degra.accounting.core.address.model.Address;
import lv.degra.accounting.core.address.model.AddressRepository;
import lv.degra.accounting.core.address.register.model.AddressRegister;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class AddressUpdateProcessor implements ItemProcessor<AddressRegister, Address> {


    private final AddressRepository addressRepository;

    @Autowired
    public AddressUpdateProcessor(AddressRepository addressRepository) {
        this.addressRepository = addressRepository;
    }

    @Override
    public Address process(AddressRegister addressRegister) {
        Optional<Address> optionalAddress = addressRepository.findByCode(addressRegister.getCode());

        Address address;
        if (optionalAddress.isPresent()) {
            address = optionalAddress.get();
            Address newAddress = mapAddressRegisterToAddress(addressRegister, address);
            if (address.equals(newAddress)) {
                return null;
            }
        } else {
            address = mapAddressRegisterToAddress(addressRegister, new Address());
        }

        return address;
    }


    private Address mapAddressRegisterToAddress(AddressRegister addressRegister, Address address) {
        address.setCode(addressRegister.getCode());
        address.setType(addressRegister.getType());
        address.setStatus(addressRegister.getStatus());
        address.setParentCode(addressRegister.getParentCode());
        address.setParentType(addressRegister.getParentType());
        address.setName(addressRegister.getName());
        address.setSortByValue(addressRegister.getSortName());
        address.setZip(addressRegister.getZip());
        address.setDateFrom(addressRegister.getDateFrom());
        address.setUpdateDatePublic(addressRegister.getUpdateDatePublic());
        address.setDateTo(addressRegister.getDateTo());
        address.setFullAddress(addressRegister.getFullAddress());
        address.setTerritorialUnitCode(addressRegister.getTerritorialUnitCode());

        return address;
    }

}
