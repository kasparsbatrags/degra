package lv.degra.accounting.company.downloader.controllers;

import lv.degra.accounting.core.company.register.service.CompanyRegisterService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static lv.degra.accounting.core.system.configuration.DegraConfig.*;

@RestController
@RequestMapping(API_LINK + COMPANY)
public class CompanyController {

    private final CompanyRegisterService companyRegisterService;

    public CompanyController(CompanyRegisterService companyRegisterService) {
        this.companyRegisterService = companyRegisterService;
    }

    @GetMapping(IMPORT)
    public void downloadData() {
        companyRegisterService.importData();
    }

}
