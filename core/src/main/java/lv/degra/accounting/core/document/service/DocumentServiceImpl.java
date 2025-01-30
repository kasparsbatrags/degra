package lv.degra.accounting.core.document.service;

import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import lv.degra.accounting.core.account.maper.AccountPostedMapper;
import lv.degra.accounting.core.document.dto.DocumentDto;
import lv.degra.accounting.core.document.model.Document;
import lv.degra.accounting.core.document.model.DocumentRepository;
import lv.degra.accounting.core.document.service.exception.SaveDocumentException;

@Slf4j
@Service
public class DocumentServiceImpl implements DocumentService {

	private static final String SAVE_EXCEPTION_MESSAGE = "Kļūda saglabājot dokumentu! ";

	private final DocumentRepository documentRepository;
	private final DocumentStatusService documentStatusService;

	private final ModelMapper modelMapper;
	private final AccountPostedMapper accountPostedMapper;

	@Autowired
	public DocumentServiceImpl(DocumentRepository documentRepository, DocumentStatusService documentStatusService, ModelMapper modelMapper,
			AccountPostedMapper accountPostedMapper) {
		this.documentRepository = documentRepository;
		this.documentStatusService = documentStatusService;
		this.modelMapper = modelMapper;
		this.accountPostedMapper = accountPostedMapper;
	}

	@Override
	public DocumentDto getDocumentById(Integer id) {
		return modelMapper.map(documentRepository.getReferenceById(id.longValue()), DocumentDto.class);
	}

	@Transactional
	public DocumentDto saveDocument(DocumentDto documentDto) {
		if (documentDto == null) {
			throw new IllegalArgumentException("DocumentDto cannot be null");
		}

		try {
			Document document;
			if (documentDto.getId() != null) {
				document = documentRepository.findById(Long.valueOf(documentDto.getId())).orElseThrow(
						() -> new EntityNotFoundException("Document with ID " + documentDto.getId() + " not found in the system."));
				modelMapper.map(documentDto, document);
			} else {
				document = modelMapper.map(documentDto, Document.class);
				document.setDocumentStatus(documentStatusService.getNewDocumentStatus());
			}
			return  modelMapper.map(documentRepository.save(document), DocumentDto.class);

		} catch (DataIntegrityViolationException e) {
			log.error("Error saving document: {}, {}", e.getMessage(), e.toString());
			if (e.getCause() instanceof ConstraintViolationException) {
				throw new SaveDocumentException("Constraint violation: " + e.getMessage());
			}
			throw new SaveDocumentException(SAVE_EXCEPTION_MESSAGE + e.getMessage());
		}
	}

	public List<DocumentDto> getDocumentList() {
		return documentRepository.findAll(Sort.by(Sort.Direction.ASC, "id")).stream().map(document -> {
			return modelMapper.map(document, DocumentDto.class);
		}).toList();
	}

	public void deleteById(Integer documentId) {
		documentRepository.deleteById(Long.valueOf(documentId));
	}

}
