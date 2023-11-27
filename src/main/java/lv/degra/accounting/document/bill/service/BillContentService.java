package lv.degra.accounting.document.bill.service;

import java.util.List;

import lv.degra.accounting.document.dto.DocumentContentDto;

public interface BillContentService {
	List<DocumentContentDto> getByDocumentId(Integer documentId);
}
