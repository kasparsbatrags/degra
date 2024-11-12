package lv.degra.accounting.core.document.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lv.degra.accounting.core.document.model.DocumentStatus;
import lv.degra.accounting.core.document.model.DocumentStatusRepository;

@Service
public class DocumentStatusServiceImpl implements DocumentStatusService {

	private final DocumentStatusRepository documentStatusRepository;

	@Autowired
	public DocumentStatusServiceImpl(DocumentStatusRepository documentStatusRepository) {
		this.documentStatusRepository = documentStatusRepository;
	}

	public DocumentStatus getNewDocumentStatus() {
		return documentStatusRepository.findByCode("J");
	}
}
