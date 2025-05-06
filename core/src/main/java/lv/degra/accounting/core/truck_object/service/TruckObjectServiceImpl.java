package lv.degra.accounting.core.truck_object.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import lv.degra.accounting.core.config.mapper.FreightMapper;
import lv.degra.accounting.core.truck_object.dto.TruckObjectDto;
import lv.degra.accounting.core.truck_object.model.TruckObject;
import lv.degra.accounting.core.truck_object.model.TruckObjectRepository;

@Service
public class TruckObjectServiceImpl implements TruckObjectService {

	private final TruckObjectRepository truckObjectRepository;
	private final FreightMapper freightMapper;

	public TruckObjectServiceImpl(TruckObjectRepository truckObjectRepository, FreightMapper freightMapper) {
		this.truckObjectRepository = truckObjectRepository;
		this.freightMapper = freightMapper;
	}

	public List<TruckObject> getTruckObjectList() {
		return truckObjectRepository.findAll();
	}

	public List<TruckObjectDto> getTruckObjectListDto() {
		return getTruckObjectList().stream().map(freightMapper::toDto).toList();
	}

	public TruckObjectDto saveTruckObject(TruckObjectDto truckObjectDto) {
		TruckObject truckObject = freightMapper.toEntity(truckObjectDto);
		truckObject = truckObjectRepository.save(truckObject);
		return freightMapper.toDto(truckObject);
	}

	public List<TruckObjectDto> findSimilarObjects(String name) {
		return truckObjectRepository.findSimilarByName(name).stream()
				.map(freightMapper::toDto)
				.collect(Collectors.toList());
	}

	public boolean existsByNameIgnoreCase(String name) {
		return truckObjectRepository.existsByNameIgnoreCase(name);
	}

}
