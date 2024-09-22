package lv.degra.accounting.core.company.exception;

import lombok.extern.slf4j.Slf4j;
import lv.degra.accounting.core.company.model.Company;

@Slf4j
public class UnableToSaveCompanyException extends RuntimeException {
    public UnableToSaveCompanyException(Exception e, Company company) {
        log.error(e.getMessage());
        log.error(company.toString());
    }
}
