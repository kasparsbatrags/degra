package lv.degra.accounting.address.controller;

import com.fasterxml.jackson.annotation.JsonView;
import io.swagger.v3.oas.annotations.Hidden;
import lv.degra.accounting.address.service.DownloadAddressDataService;
import lv.degra.accounting.core.address.model.Address;
import lv.degra.accounting.core.address.service.AddressService;
import lv.degra.accounting.core.address.view.AddressPublicView;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import static lv.degra.accounting.address.controller.AddressController.ADDRESS;


@RestController
@RequestMapping(AddressController.API_LINK + ADDRESS)
public class AddressController {
    public static final String API_LINK = "/API";
    public static final String ADDRESS = "/address";
    public static final String ADDRESS_REGISTER_IMPORT = "/import";
    public static final String SEARCH = "/search";


    private final DownloadAddressDataService downloadAddressDataService;
    private final AddressService addressService;

    @Autowired
    public AddressController(DownloadAddressDataService downloadAddressDataService, AddressService addressService) {
        this.downloadAddressDataService = downloadAddressDataService;
        this.addressService = addressService;
    }

    @Hidden
    @GetMapping(value = ADDRESS_REGISTER_IMPORT)
    public void downloadArData() {
        downloadAddressDataService.downloadArData();
    }

    @GetMapping(value = SEARCH)
    @JsonView({AddressPublicView.class})
    public ResponseEntity<List<Address>> searchEntities(@RequestParam("query") String searchString) {
        List<Address> results = addressService.getByMultipleWords(searchString);

        if (results.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(results, HttpStatus.OK);
    }


}
