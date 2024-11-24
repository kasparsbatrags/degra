package lv.degra.accounting.core.document.service;

import java.util.ArrayList;
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
import lv.degra.accounting.core.account.posted.dto.AccountPostedDto;
import lv.degra.accounting.core.account.posted.dto.AccountPostedMapper;
import lv.degra.accounting.core.account.posted.model.AccountPosted;
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
//			if (!document.getAccountPostedList().isEmpty()) {
//				updateAccountPosted(documentDto, document);
//			}
			Document newDocument = documentRepository.save(document);
			DocumentDto newDocumentDto = modelMapper.map(newDocument, DocumentDto.class);
			return newDocumentDto;

		} catch (DataIntegrityViolationException e) {
			log.error("Error saving document: {}, {}", e.getMessage(), e.toString());
			if (e.getCause() instanceof ConstraintViolationException) {
				throw new SaveDocumentException("Constraint violation: " + e.getMessage());
			}
			throw new SaveDocumentException(SAVE_EXCEPTION_MESSAGE + e.getMessage());
		}
	}

	private void updateAccountPosted(DocumentDto documentDto, Document document) {
		List<AccountPostedDto> newAccpountPostsList = documentDto.getAccountPostedList();
		List<AccountPosted> currentAccountPostedList = document.getAccountPostedList();

		if (newAccpountPostsList == null || newAccpountPostsList.isEmpty()) {
			if (currentAccountPostedList != null) {
				currentAccountPostedList.clear();
			}
		} else {
			if (currentAccountPostedList == null) {
				currentAccountPostedList = new ArrayList<>();
				document.setAccountPostedList(currentAccountPostedList);
			} else {
				currentAccountPostedList.clear();
			}

			for (AccountPostedDto dto : newAccpountPostsList) {
				dto.setDocumentDto(modelMapper.map(document, DocumentDto.class));
				AccountPosted entity = accountPostedMapper.toEntity(dto);
				currentAccountPostedList.add(entity);
			}
		}
	}

	public List<DocumentDto> getDocumentList() {
		return documentRepository.findAll(Sort.by(Sort.Direction.ASC, "id")).stream().map(document -> {
			DocumentDto documentDto = modelMapper.map(document, DocumentDto.class);
			return documentDto;
		}).toList();
	}

	public void deleteById(Integer documentId) {
		documentRepository.deleteById(Long.valueOf(documentId));
	}

}
