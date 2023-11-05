package lv.degra.accounting.document.service;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lv.degra.accounting.document.dto.DocumentDto;
import lv.degra.accounting.document.model.Document;
import lv.degra.accounting.document.model.DocumentRepository;
import lv.degra.accounting.system.exception.SaveDocumentException;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
@NoArgsConstructor
public class DocumentServiceImpl implements DocumentService {

    private static final String SAVE_EXCEPTION_MESSAGE = "Kļūda saglabājot dokumentu! ";
    @Autowired
    private DocumentRepository documentRepository;
    @Autowired
    private ModelMapper modelMapper;

    public Document saveDocument(DocumentDto documentDto) {
        try {
            if (documentDto.getId() != null) {
                Document document = documentRepository.getById(documentDto.getId());
                mapToExistEntity(documentDto, document);
                return documentRepository.save(document);
            } else {
                return documentRepository.save(mapToNewEntity(documentDto));
            }

        } catch (RuntimeException exception) {
            throw new SaveDocumentException(SAVE_EXCEPTION_MESSAGE + exception.getMessage());
        }
    }

    public List<Document> getDocumentList() {
        return documentRepository.findAll(Sort.by(Sort.Direction.ASC, "id"));
    }

    private Document mapToNewEntity(DocumentDto documentDto) {
        return modelMapper.map(documentDto, Document.class);
    }

    public void mapToExistEntity(DocumentDto documentDto, Document document) {
        modelMapper.map(documentDto, document);
    }

    public DocumentDto mapToDto(Document document) {
        return modelMapper.map(document, DocumentDto.class);
    }

    public void deleteDocumentById(Integer documentId) {
        documentRepository.deleteById(Long.valueOf(documentId));
    }


}
