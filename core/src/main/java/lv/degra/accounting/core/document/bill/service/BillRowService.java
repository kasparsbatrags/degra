package lv.degra.accounting.core.document.bill.service;

import lv.degra.accounting.core.document.dto.BillContentDto;

import java.util.List;

public interface BillRowService {
    List<BillContentDto> getByDocumentId(Integer documentId);

    Double getBillRowSumByDocumentId(Integer documentId);

    BillContentDto saveBillRow(BillContentDto billContentDto);

    BillContentDto getById(Integer billRowId);

    void deleteBillRowById(Integer id);

    void deleteBillRowByDocumentId(Integer documentId);
}
