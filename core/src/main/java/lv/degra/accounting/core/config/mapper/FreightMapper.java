package lv.degra.accounting.core.config.mapper;

import org.modelmapper.ModelMapper;
import org.modelmapper.PropertyMap;
import org.springframework.stereotype.Component;

import lv.degra.accounting.core.cargo_type.dto.CargoTypeDto;
import lv.degra.accounting.core.cargo_type.model.CargoType;
import lv.degra.accounting.core.truck.dto.TruckDto;
import lv.degra.accounting.core.truck.model.Truck;
import lv.degra.accounting.core.truck_object.dto.TruckObjectDto;
import lv.degra.accounting.core.truck_object.model.TruckObject;
import lv.degra.accounting.core.truck_route.dto.TruckRouteDto;
import lv.degra.accounting.core.truck_route.model.TruckRoute;
import lv.degra.accounting.core.truck_route_page.dto.TruckRoutePageDto;
import lv.degra.accounting.core.truck_route_page.model.TruckRoutePage;

@Component
public class FreightMapper {
	private final ModelMapper modelMapper;

	public FreightMapper(ModelMapper modelMapper) {
		this.modelMapper = modelMapper;

		modelMapper.addMappings(new PropertyMap<TruckRoutePage, TruckRoutePageDto>() {
			@Override
			protected void configure() {
				map().setFuelConsumptionNorm(source.getTruck().getFuelConsumptionNorm());
				map().setTruckRegistrationNumber(source.getTruck().getRegistrationNumber());
			}
		});

	}

	public TruckRoutePageDto toDto(TruckRoutePage truckRoutePage) {
		return modelMapper.map(truckRoutePage, TruckRoutePageDto.class);
	}

	public TruckRoutePage toEntity(TruckRoutePageDto truckRoutePageDto) {
		return modelMapper.map(truckRoutePageDto, TruckRoutePage.class);
	}

	public TruckObjectDto toDto(TruckObject truckObject) {
		return modelMapper.map(truckObject, TruckObjectDto.class);
	}

	public TruckObject toEntity(TruckObjectDto truckObjectDto) {
		return modelMapper.map(truckObjectDto, TruckObject.class);
	}

	public TruckRouteDto toDto(TruckRoute truckRoute) {
		return modelMapper.map(truckRoute, TruckRouteDto.class);
	}

	public TruckRoute toEntity(TruckRouteDto truckRouteDto) {
		return modelMapper.map(truckRouteDto, TruckRoute.class);
	}

	public CargoTypeDto toDto(CargoType cargoType) {
		return modelMapper.map(cargoType, CargoTypeDto.class);
	}

	public CargoType toEntity(CargoTypeDto cargoTypeDto) {
		return modelMapper.map(cargoTypeDto, CargoType.class);
	}

	public TruckDto toDto(Truck truck) {
		return modelMapper.map(truck, TruckDto.class);
	}

	public Truck toEntity(TruckDto truckDto) {
		return modelMapper.map(truckDto, Truck.class);
	}
}
