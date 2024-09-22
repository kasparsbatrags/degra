package lv.degra.accounting.address.controller;

import com.fasterxml.jackson.annotation.JsonView;
import io.swagger.v3.oas.annotations.Hidden;
import lv.degra.accounting.core.address.register.model.AddressRegister;
import lv.degra.accounting.core.address.register.service.AddressRegisterService;
import lv.degra.accounting.core.address.register.view.AddressPublicView;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import static lv.degra.accounting.core.system.configuration.DegraConfig.*;


@RestController
@RequestMapping(API_LINK + ADDRESS)
public class AddressRegisterController {

    public static final String SEARCH = "/search";
    private final AddressRegisterService addressRegisterService;


    @Autowired
    public AddressRegisterController(AddressRegisterService addressRegisterService) {
        this.addressRegisterService = addressRegisterService;

    }

    @Hidden
    @GetMapping(value = IMPORT)
    public void importData() {
        addressRegisterService.importData();
    }

    @GetMapping(value = SEARCH)
    @JsonView({AddressPublicView.class})
    public ResponseEntity<List<AddressRegister>> searchEntities(@RequestParam("query") String searchString) {
        List<AddressRegister> results = addressRegisterService.getByMultipleWords(searchString);

        if (results.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(results, HttpStatus.OK);
    }


}
