package lv.degra.accounting.core.document.bill.service;

import java.util.List;

import lv.degra.accounting.core.document.dto.BillContentDto;

public interface BillRowService {
    List<BillContentDto> getByDocumentId(Integer documentId);

    Double getBillRowSumByDocumentId(Integer documentId);

    BillContentDto saveBillRow(BillContentDto billContentDto);

    BillContentDto getById(Integer billRowId);

    void deleteById(Integer id);

    void deleteByDocumentId(Integer documentId);
}
