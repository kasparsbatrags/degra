package lv.degra.accounting.document.bill.service;

import lv.degra.accounting.document.dto.BillContentDto;

import java.util.List;

public interface BillRowService {
    List<BillContentDto> getByDocumentId(Integer documentId);

    Double getBillRowSumByDocumentId(Integer documentId);

    BillContentDto saveBillRow(BillContentDto billContentDto);

    BillContentDto getById(Integer billRowId);

    void deleteBillRowById(Integer id);

    void deleteBillRowByDocumentId(Integer documentId);
}
