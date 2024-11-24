package lv.degra.accounting.core.company.register.service;

import java.util.List;

import lv.degra.accounting.core.company.register.model.CompanyRegister;

public interface CompanyRegisterService {

    void importData();

	List<CompanyRegister> findByNameContainingIgnoreCase(String name);
}
