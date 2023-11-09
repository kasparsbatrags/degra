package lv.degra.accounting.document.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import lv.degra.accounting.document.model.DocumentType;
import lv.degra.accounting.document.model.DocumentTypeRepository;

@Service
public class DocumentTypeServiceImpl implements DocumentTypeService {
	@Autowired
	private DocumentTypeRepository documentTypeRepository;

	public List<DocumentType> getDocumentTypeList() {
		return documentTypeRepository.findAll(Sort.by(Sort.Direction.ASC, "id"));
	}
}
