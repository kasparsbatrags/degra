package lv.degra.accounting.document.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import lv.degra.accounting.document.model.DocumentDirection;
import lv.degra.accounting.document.model.DocumentDirectionRepository;

@Service
public class DocumentDirectionServiceImpl implements DocumentDirectionService {
	@Autowired
	private DocumentDirectionRepository documentDirectionRepository;

	public List<DocumentDirection> getDocumentDirectionList() {
		return documentDirectionRepository.findAll(Sort.by(Sort.Direction.ASC, "id"));
	}
}
