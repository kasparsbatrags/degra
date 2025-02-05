package lv.degra.accounting.core.truck_object.service;

import java.util.List;

import org.springframework.stereotype.Service;

import lv.degra.accounting.core.truck_object.dto.TruckObjectDto;
import lv.degra.accounting.core.truck_object.model.TrucObjectRepository;

@Service
public class TruckObjectServiceImpl implements TruckObjectService {

	private final TrucObjectRepository trucObjectRepository;

	public TruckObjectServiceImpl(TrucObjectRepository trucObjectRepository) {
		this.trucObjectRepository = trucObjectRepository;
	}

	public List<TruckObjectDto> getTruckObjectList() {
		return trucObjectRepository.findAll()
				.stream()
				.map(truckObject -> new TruckObjectDto(truckObject.getId(), truckObject.getName()))
				.toList();
	}

}
