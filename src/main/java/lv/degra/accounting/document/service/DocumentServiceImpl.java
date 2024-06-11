package lv.degra.accounting.document.service;

import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lv.degra.accounting.document.dto.DocumentDto;
import lv.degra.accounting.document.model.Document;
import lv.degra.accounting.document.model.DocumentRepository;
import lv.degra.accounting.system.exception.SaveDocumentException;

@Service
@AllArgsConstructor
@NoArgsConstructor
public class DocumentServiceImpl implements DocumentService {

	private static final String SAVE_EXCEPTION_MESSAGE = "Kļūda saglabājot dokumentu! ";
	@Autowired
	private DocumentRepository documentRepository;
	@Autowired
	private ModelMapper modelMapper;

	@Override
	public DocumentDto getDocumentById(Integer id) {
		return modelMapper.map(documentRepository.getById(id), DocumentDto.class);
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
