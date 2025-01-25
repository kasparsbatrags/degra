package lv.degra.accounting.company.search;

import static lv.degra.accounting.core.system.configuration.DegraConfig.API_LINK;
import static lv.degra.accounting.core.system.configuration.DegraConfig.COMPANY;
import static lv.degra.accounting.core.system.configuration.DegraConfig.SUGGESTIONS;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lv.degra.accounting.core.company.register.model.CompanyRegister;
import lv.degra.accounting.core.company.register.service.CompanyRegisterService;

@RestController
@RequestMapping(API_LINK + COMPANY)
public class CompanyController {

	private final CompanyRegisterService companyRegisterService;

	public CompanyController(CompanyRegisterService companyRegisterImportService) {
		this.companyRegisterService = companyRegisterImportService;
	}

	@GetMapping(SUGGESTIONS)
	public ResponseEntity<List<CompanyRegister>> getSuggestions(@Valid @RequestParam String query) {
		List<CompanyRegister> suggestions = companyRegisterService.findByNameContainingIgnoreCase(query);
		return ResponseEntity.ok(suggestions);
	}
}
