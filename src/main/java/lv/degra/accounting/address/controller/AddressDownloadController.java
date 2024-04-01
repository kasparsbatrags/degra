package lv.degra.accounting.address.controller;

import lv.degra.accounting.address.service.DownloadAddressDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(AddressDownloadController.ADDRESS_REGISTER)
public class AddressDownloadController {
    public static final String ADDRESS_REGISTER = "/API/address-register";
    public static final String DOWNLOAD = "/download";
    @Autowired
    private DownloadAddressDataService downloadAddressDataService;

    @GetMapping(value = DOWNLOAD)
    public void downloadArData() {
        downloadAddressDataService.downloadArData();
    }

}
