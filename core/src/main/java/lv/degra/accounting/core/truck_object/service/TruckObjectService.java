package lv.degra.accounting.core.truck_object.service;

import java.util.List;

import lv.degra.accounting.core.truck_object.dto.TruckObjectDto;
import lv.degra.accounting.core.truck_object.model.TruckObject;

public interface TruckObjectService {
	List<TruckObject> getTruckObjectList();

	List<TruckObjectDto> getTruckObjectListDto();
}
