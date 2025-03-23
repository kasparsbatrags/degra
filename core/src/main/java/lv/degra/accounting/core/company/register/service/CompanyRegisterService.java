package lv.degra.accounting.core.company.register.service;

import java.util.List;

import lv.degra.accounting.core.company.register.dto.CompanyRegisterDto;

public interface CompanyRegisterService {
	List<CompanyRegisterDto> findByNameContainingIgnoreCase(String name);

	boolean existsByRegistrationNumber(String registrationNumber);
}
