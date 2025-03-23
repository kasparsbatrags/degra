package lv.degra.accounting.core.company;

import lv.degra.accounting.core.company.register.dto.CompanyRegisterDto;
import lv.degra.accounting.core.company.register.model.CompanyRegister;

public class CompanyRegisterMapper {

	public static CompanyRegisterDto toDto(CompanyRegister entity) {
		if (entity == null) {
			return null;
		}

		return new CompanyRegisterDto(
				entity.getId(),
				entity.getRegisterNumber(),
				entity.getSepaCode(),
				entity.getName(),
				entity.getRegisteredDate(),
				entity.getTerminatedDate()
		);
	}

	public static CompanyRegister toEntity(CompanyRegisterDto dto) {
		if (dto == null) {
			return null;
		}

		CompanyRegister entity = new CompanyRegister();
		entity.setId(dto.getId());
		entity.setRegisterNumber(dto.getRegisterNumber());
		entity.setSepaCode(dto.getSepaCode());
		entity.setName(dto.getName());
		entity.setRegisteredDate(dto.getRegisteredDate());
		entity.setTerminatedDate(dto.getTerminatedDate());
		return entity;
	}
}
