package lv.degra.accounting.core.document.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import lv.degra.accounting.core.document.model.DocumentTransactionType;
import lv.degra.accounting.core.document.model.DocumentTransactionTypeRepository;

@Service
public class DocumentTransactionTypeServiceImpl implements DocumentTransactionTypeService {

	private final DocumentTransactionTypeRepository documentTransactionTypeRepository;

	@Autowired
	public DocumentTransactionTypeServiceImpl(DocumentTransactionTypeRepository documentTransactionTypeRepository) {
		this.documentTransactionTypeRepository = documentTransactionTypeRepository;
	}

	public List<DocumentTransactionType> getDocumentTransactionTypeList() {
		return documentTransactionTypeRepository.findAll(Sort.by(Sort.Direction.ASC, "id"));
	}
}
