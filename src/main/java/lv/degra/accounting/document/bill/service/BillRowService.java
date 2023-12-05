package lv.degra.accounting.document.bill.service;

import java.util.List;

import lv.degra.accounting.document.dto.BillContentDto;

public interface BillRowService {
	List<BillContentDto> getByDocumentId(Integer documentId);
	BillContentDto saveBillRow(BillContentDto billContentDto);

	BillContentDto getById(Integer billRowId);

	void deleteBillRowById(Integer id);

	void deleteBillRowByDocumentId(Integer documentId);
}
