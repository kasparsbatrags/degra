package lv.degra.accounting.document.bill.service;

import lv.degra.accounting.document.bill.model.BillContent;
import lv.degra.accounting.document.bill.model.BillContentRepository;
import lv.degra.accounting.document.dto.BillContentDto;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BillRowServiceImpl implements BillRowService {

    @Autowired
    private BillContentRepository billContentRepository;
    @Autowired
    private ModelMapper modelMapper;

    public List<BillContentDto> getByDocumentId(Integer documentId) {
        List<BillContent> billContents = billContentRepository.findByDocumentId(documentId);
        return billContents.stream()
                .map(billContent -> modelMapper.map(billContent, BillContentDto.class))
                .toList();
    }

    @Override
    public Double getBillRowSumByDocumentId(Integer documentId) {
        List<BillContent> billContents = billContentRepository.findByDocumentId(documentId);
        double totalSum = 0;
        if (billContents != null) {
            totalSum = billContents.stream()
                    .mapToDouble(BillContent::getSumTotal)
                    .sum();
        }
        return totalSum;
    }

    public BillContentDto saveBillRow(BillContentDto billContentDto) {
        return modelMapper.map(billContentRepository.save(modelMapper.map(billContentDto, BillContent.class)), BillContentDto.class);
    }

    public BillContentDto getById(Integer billRowId) {
        return modelMapper.map(billContentRepository.getById(billRowId), BillContentDto.class);
    }

    public void deleteBillRowById(Integer id) {
        billContentRepository.deleteById(Long.valueOf(id));
    }

    public void deleteBillRowByDocumentId(Integer documentId) {
        billContentRepository.deleteAll(billContentRepository.findByDocumentId(documentId));
    }
}
