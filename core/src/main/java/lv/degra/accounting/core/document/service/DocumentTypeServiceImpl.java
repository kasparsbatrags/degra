package lv.degra.accounting.core.document.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import lv.degra.accounting.core.document.model.DocumentType;
import lv.degra.accounting.core.document.model.DocumentTypeRepository;

@Service
public class DocumentTypeServiceImpl implements DocumentTypeService {

	private final DocumentTypeRepository documentTypeRepository;

	@Autowired
	public DocumentTypeServiceImpl(DocumentTypeRepository documentTypeRepository) {
		this.documentTypeRepository = documentTypeRepository;
	}

	public List<DocumentType> getDocumentTypeList() {
		return documentTypeRepository.findAll(Sort.by(Sort.Direction.ASC, "id"));
	}
}
