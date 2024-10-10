package lv.degra.accounting.core.document.bill.service;

import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lv.degra.accounting.core.document.bill.model.BillContent;
import lv.degra.accounting.core.document.bill.model.BillContentRepository;
import lv.degra.accounting.core.document.dto.BillContentDto;

@Service
public class BillRowServiceImpl implements BillRowService {

	private final BillContentRepository billContentRepository;
	private final ModelMapper modelMapper;

	@Autowired
	public BillRowServiceImpl(BillContentRepository billContentRepository, ModelMapper modelMapper) {
		this.billContentRepository = billContentRepository;
		this.modelMapper = modelMapper;
	}

	public List<BillContentDto> getByDocumentId(Integer documentId) {
		List<BillContent> billContents = billContentRepository.getByDocumentId(documentId);
		return billContents.stream().map(billContent -> modelMapper.map(billContent, BillContentDto.class)).toList();
	}

	@Override
	public Double getBillRowSumByDocumentId(Integer documentId) {
		List<BillContent> billContents = billContentRepository.getByDocumentId(documentId);
		double totalSum = 0;
		if (billContents != null) {
			totalSum = billContents.stream().mapToDouble(BillContent::getSumTotal).sum();
		}
		return totalSum;
	}

	public BillContentDto saveBillRow(BillContentDto billContentDto) {
		return modelMapper.map(billContentRepository.save(modelMapper.map(billContentDto, BillContent.class)), BillContentDto.class);
	}

	public BillContentDto getById(Integer billRowId) {
		return modelMapper.map(billContentRepository.getReferenceById(billRowId.longValue()), BillContentDto.class);
	}

	public void deleteById(Integer id) {
		billContentRepository.deleteById(Long.valueOf(id));
	}

	public void deleteByDocumentId(Integer documentId) {
		billContentRepository.deleteAll(billContentRepository.getByDocumentId(documentId));
	}
}
