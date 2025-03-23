package lv.degra.accounting.core.company.register.dto;

import java.io.Serializable;
import java.time.LocalDate;

import lombok.Value;

/**
 * DTO for {@link lv.degra.accounting.core.company.register.model.CompanyRegister}
 */
@Value
public class CompanyRegisterDto implements Serializable {
	Long id;
	String registerNumber;
	String sepaCode;
	String name;
	LocalDate registeredDate;
	LocalDate terminatedDate;
}