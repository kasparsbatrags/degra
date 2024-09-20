package lv.degra.accounting.address.service;

import lv.degra.accounting.core.address.model.Address;
import lv.degra.accounting.core.address.model.AddressRepository;
import org.springframework.batch.item.Chunk;
import org.springframework.batch.item.ItemWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class AddressUpdateWriter implements ItemWriter<Address> {

    @Autowired
    private AddressRepository addressRepository;

    @Override
    public void write(Chunk<? extends Address> items) {
        addressRepository.saveAll(items);
    }
}
