package lv.degra.accounting.core.cargo_type.service;

import java.util.List;

import lv.degra.accounting.core.cargo_type.dto.CargoTypeDto;

public interface CargoTypeService {
	List<CargoTypeDto> getCargoTypesDto();
}
