package lv.degra.accounting.document.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import lv.degra.accounting.document.model.DocumentSubType;
import lv.degra.accounting.document.model.DocumentSubTypeRepository;

@Service
public class DocumentSubTypeServiceImpl implements DocumentSubTypeService {
	@Autowired
	private DocumentSubTypeRepository documentSubTypeRepository;

	public List<DocumentSubType> getDocumentSubTypeList() {
		return documentSubTypeRepository.findAll(Sort.by(Sort.Direction.ASC, "id"));
	}
}
