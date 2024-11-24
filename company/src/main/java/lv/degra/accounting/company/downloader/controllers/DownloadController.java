package lv.degra.accounting.company.downloader.controllers;

import static lv.degra.accounting.core.system.configuration.DegraConfig.API_LINK;
import static lv.degra.accounting.core.system.configuration.DegraConfig.COMPANY;
import static lv.degra.accounting.core.system.configuration.DegraConfig.IMPORT;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lv.degra.accounting.core.company.register.service.CompanyRegisterService;

@RestController
@RequestMapping(API_LINK + COMPANY)
public class DownloadController {

    private final CompanyRegisterService companyRegisterService;

    public DownloadController(CompanyRegisterService companyRegisterService) {
        this.companyRegisterService = companyRegisterService;
    }

    @GetMapping(IMPORT)
    public void downloadData() {
        companyRegisterService.importData();
    }

}
