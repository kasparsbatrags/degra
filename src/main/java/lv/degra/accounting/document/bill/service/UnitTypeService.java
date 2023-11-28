package lv.degra.accounting.document.bill.service;

import java.util.List;

import lv.degra.accounting.document.bill.model.UnitType;
import lv.degra.accounting.document.dto.DocumentContentDto;

public interface UnitTypeService {
	List<UnitType> getAllUnitTypes();

}
