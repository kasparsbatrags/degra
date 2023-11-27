package lv.degra.accounting.document.bill.service;

import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lv.degra.accounting.document.dto.DocumentContentDto;
import lv.degra.accounting.document.bill.model.BillContent;
import lv.degra.accounting.document.bill.model.BillContentRepository;

@Service
public class BillContentServiceImpl implements BillContentService {

	@Autowired
	private BillContentRepository billContentRepository;
	@Autowired
	private ModelMapper modelMapper;

	public List<DocumentContentDto> getByDocumentId(Integer documentId) {
		List<BillContent> billContents = billContentRepository.findByDocumentId(documentId);
		return billContents.stream()
				.map(billContent -> modelMapper.map(billContent, DocumentContentDto.class))
				.toList();
	}
}
