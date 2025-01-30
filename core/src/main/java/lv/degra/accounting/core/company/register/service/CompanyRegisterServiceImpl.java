package lv.degra.accounting.core.company.register.service;

import java.util.List;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lv.degra.accounting.core.company.register.model.CompanyRegister;
import lv.degra.accounting.core.company.register.model.CompanyRegisterRepository;

@Service
@RequiredArgsConstructor
public class CompanyRegisterServiceImpl implements CompanyRegisterService {

    private final CompanyRegisterRepository companyRegisterRepository;

    public List<CompanyRegister> findByNameContainingIgnoreCase(String name) {
        return companyRegisterRepository.findTopByNameContainingIgnoreCase(name);
    }

    public boolean existsByRegistrationNumber(String registrationNumber) {
        return companyRegisterRepository.existsByRegisterNumber(registrationNumber);
    }
}
