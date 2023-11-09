package lv.degra.accounting.document.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import lv.degra.accounting.document.model.DocumentTransactionType;
import lv.degra.accounting.document.model.DocumentTransactionTypeRepository;

@Service
public class DocumentTransactionTypeServiceImpl implements DocumentTransactionTypeService {
	@Autowired
	private DocumentTransactionTypeRepository documentTransactionTypeRepository;

	public List<DocumentTransactionType> getDocumentTransactionTypeList() {
		return documentTransactionTypeRepository.findAll(Sort.by(Sort.Direction.ASC, "id"));
	}
}
