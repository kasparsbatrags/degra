package lv.degra.accounting.core.document.bill.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lv.degra.accounting.core.document.bill.model.UnitType;
import lv.degra.accounting.core.document.bill.model.UnitTypeRepository;

@Service
public class UnitTypeServiceImpl  implements UnitTypeService {

	@Autowired
	private UnitTypeRepository unitTypeRepository;

	public List<UnitType> getAllUnitTypes() {
		return unitTypeRepository.findAll();
	}
}
