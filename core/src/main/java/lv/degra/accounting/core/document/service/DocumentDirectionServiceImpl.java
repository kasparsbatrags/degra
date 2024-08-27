package lv.degra.accounting.core.document.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import lv.degra.accounting.core.document.model.DocumentDirection;
import lv.degra.accounting.core.document.model.DocumentDirectionRepository;

@Service
public class DocumentDirectionServiceImpl implements DocumentDirectionService {

	private final DocumentDirectionRepository documentDirectionRepository;

	@Autowired
	public DocumentDirectionServiceImpl(DocumentDirectionRepository documentDirectionRepository) {
		this.documentDirectionRepository = documentDirectionRepository;
	}

	public List<DocumentDirection> getDocumentDirectionList() {
		return documentDirectionRepository.findAll(Sort.by(Sort.Direction.ASC, "id"));
	}
}
