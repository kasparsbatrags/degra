package lv.degra.accounting.core.document.service;

import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lv.degra.accounting.core.document.dto.DocumentDto;
import lv.degra.accounting.core.document.model.Document;
import lv.degra.accounting.core.document.model.DocumentRepository;
import lv.degra.accounting.core.system.exception.SaveDocumentException;

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
		try {
			if (documentDto.getId() != null) {
				return documentRepository.findById(Long.valueOf(documentDto.getId())).map(document -> {
					modelMapper.map(documentDto, document);
					return modelMapper.map(documentRepository.save(document), DocumentDto.class);
				}).orElseThrow(() -> new EntityNotFoundException("Document not found with ID: " + documentDto.getId()));
			} else {
				Document document = modelMapper.map(documentDto, Document.class);
				Document savedDocument = documentRepository.save(document);
				return modelMapper.map(savedDocument, DocumentDto.class);
			}
		} catch (DataIntegrityViolationException e) {
			throw new SaveDocumentException(SAVE_EXCEPTION_MESSAGE + e.getMessage());
		}
	}

	public List<DocumentDto> getDocumentList() {
		return documentRepository.findAll(Sort.by(Sort.Direction.ASC, "id")).stream()
				.map(document -> modelMapper.map(document, DocumentDto.class)).toList();
	}

	public void deleteDocumentById(Integer documentId) {
		documentRepository.deleteById(Long.valueOf(documentId));
	}

}
