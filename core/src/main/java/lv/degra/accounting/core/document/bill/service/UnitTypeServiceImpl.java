package lv.degra.accounting.core.document.bill.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lv.degra.accounting.core.document.bill.model.UnitType;
import lv.degra.accounting.core.document.bill.model.UnitTypeRepository;

@Service
public class UnitTypeServiceImpl implements UnitTypeService {

	private final UnitTypeRepository unitTypeRepository;

	@Autowired
	public UnitTypeServiceImpl(UnitTypeRepository unitTypeRepository) {
		this.unitTypeRepository = unitTypeRepository;
	}

	public List<UnitType> getAllUnitTypes() {
		return unitTypeRepository.findAll();
	}
}
