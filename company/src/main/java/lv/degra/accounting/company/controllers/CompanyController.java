package lv.degra.accounting.company.controllers;

import static lv.degra.accounting.core.config.ApiConstants.ENDPOINT_COMPANY;
import static lv.degra.accounting.core.config.ApiConstants.ENDPOINT_SUGGESTIONS;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lv.degra.accounting.core.company.register.dto.CompanyRegisterDto;
import lv.degra.accounting.core.company.register.service.CompanyRegisterService;

@RestController
@RequestMapping(ENDPOINT_COMPANY)
public class CompanyController {

	private final CompanyRegisterService companyRegisterService;

	public CompanyController(CompanyRegisterService companyRegisterImportService) {
		this.companyRegisterService = companyRegisterImportService;
	}

	@GetMapping(ENDPOINT_SUGGESTIONS)
	public ResponseEntity<List<CompanyRegisterDto>> getSuggestions(@Valid @RequestParam String query) {
		List<CompanyRegisterDto> suggestions = companyRegisterService.findByNameContainingIgnoreCase(query);
		return ResponseEntity.ok(suggestions);
	}
}
