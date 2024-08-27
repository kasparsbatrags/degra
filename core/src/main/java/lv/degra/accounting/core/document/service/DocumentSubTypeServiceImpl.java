package lv.degra.accounting.core.document.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import lv.degra.accounting.core.document.model.DocumentSubType;
import lv.degra.accounting.core.document.model.DocumentSubTypeRepository;

@Service
public class DocumentSubTypeServiceImpl implements DocumentSubTypeService {

	private final DocumentSubTypeRepository documentSubTypeRepository;

	@Autowired
	public DocumentSubTypeServiceImpl(DocumentSubTypeRepository documentSubTypeRepository) {
		this.documentSubTypeRepository = documentSubTypeRepository;
	}

	public List<DocumentSubType> getDocumentSubTypeList() {
		return documentSubTypeRepository.findAll(Sort.by(Sort.Direction.ASC, "id"));
	}
}
