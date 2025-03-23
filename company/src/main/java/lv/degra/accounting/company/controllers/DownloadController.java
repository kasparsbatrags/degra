package lv.degra.accounting.company.controllers;

import static lv.degra.accounting.core.config.ApiConstants.ENDPOINT_COMPANY;
import static lv.degra.accounting.core.config.ApiConstants.ENDPOINT_IMPORT;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lv.degra.accounting.core.company.register.service.CompanyRegisterImportService;

@RestController
@RequestMapping(ENDPOINT_COMPANY)
public class DownloadController {

	private final CompanyRegisterImportService companyRegisterImportService;

	public DownloadController(CompanyRegisterImportService companyRegisterImportService) {
		this.companyRegisterImportService = companyRegisterImportService;
	}

	@GetMapping(ENDPOINT_IMPORT)
	public void downloadData() {
		companyRegisterImportService.importData();
	}

}
