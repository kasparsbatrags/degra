package lv.degra.accounting.core.cargo_type.service;

import java.util.List;

import org.springframework.stereotype.Service;

import lv.degra.accounting.core.cargo_type.dto.CargoTypeDto;
import lv.degra.accounting.core.cargo_type.model.CargoType;
import lv.degra.accounting.core.cargo_type.model.CargoTypeRepository;
import lv.degra.accounting.core.config.mapper.FreightMapper;

@Service
public class CargoTypeServiceImpl implements CargoTypeService {

	private final CargoTypeRepository cargoTypeRepository;
	private final FreightMapper freightMapper;

	public CargoTypeServiceImpl(CargoTypeRepository cargoTypeRepository, FreightMapper freightMapper) {
		this.cargoTypeRepository = cargoTypeRepository;
		this.freightMapper = freightMapper;
	}

	public List<CargoType> getCargoTypes() {
		return cargoTypeRepository.findAll();
	}

	public List<CargoTypeDto> getCargoTypesDto() {
		return getCargoTypes().stream().map(freightMapper::toDto).toList();
	}
}
