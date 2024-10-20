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
import lv.degra.accounting.core.account.distribution.dto.AccountCodeDistributionDto;
import lv.degra.accounting.core.account.distribution.model.AccountCodeDistribution;
import lv.degra.accounting.core.document.dto.DocumentDto;
import lv.degra.accounting.core.document.model.Document;
import lv.degra.accounting.core.document.model.DocumentRepository;
import lv.degra.accounting.core.document.service.exception.SaveDocumentException;

@Slf4j
@Service
public class DocumentServiceImpl implements DocumentService {

	private static final String SAVE_EXCEPTION_MESSAGE = "Kļūda saglabājot dokumentu! ";

	private final DocumentRepository documentRepository;

	private final ModelMapper modelMapper;

	@Autowired
	public DocumentServiceImpl(DocumentRepository documentRepository, ModelMapper modelMapper) {
		this.documentRepository = documentRepository;
		this.modelMapper = modelMapper;
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
			if (documentDto.getId() != null) {
				return documentRepository.findById(Long.valueOf(documentDto.getId())).map(document -> {
					modelMapper.map(documentDto, document);
					List<AccountCodeDistributionDto> newDistributionList = documentDto.getAccountCodeDistributionDtoList();
					List<AccountCodeDistribution> currentDistributionList = document.getAccountCodeDistributions();

					if (newDistributionList == null || newDistributionList.isEmpty()) {
						currentDistributionList.clear();
					} else {
						currentDistributionList.clear();
						currentDistributionList.addAll(modelMapper.map(newDistributionList, List.class));
					}
					return modelMapper.map(documentRepository.save(document), DocumentDto.class);

				}).orElseThrow(() -> new EntityNotFoundException("Document with ID " + documentDto.getId() + " not found in the system."));
			} else {
				Document document = modelMapper.map(documentDto, Document.class);

				List<AccountCodeDistributionDto> newDistributionList = documentDto.getAccountCodeDistributionDtoList();
				if (newDistributionList == null || newDistributionList.isEmpty()) {
					document.getAccountCodeDistributions().addAll(modelMapper.map(newDistributionList, List.class));
				}

				Document savedDocument = documentRepository.save(document);
				return modelMapper.map(savedDocument, DocumentDto.class);
			}

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
			DocumentDto documentDto = modelMapper.map(document, DocumentDto.class);
			List<AccountCodeDistributionDto> accountCodeDistributionDtoList = document.getAccountCodeDistributions().stream()
					.map(distribution -> modelMapper.map(distribution, AccountCodeDistributionDto.class)).toList();
			documentDto.setAccountCodeDistributionDtoList(accountCodeDistributionDtoList);
			return documentDto;
		}).toList();
	}

	public void deleteById(Integer documentId) {
		documentRepository.deleteById(Long.valueOf(documentId));
	}

}
