package lv.degra.accounting.document.service;

import lv.degra.accounting.document.Dto.DocumentDto;
import lv.degra.accounting.document.model.Document;
import lv.degra.accounting.document.model.DocumentRepository;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

@Service
public class DocumentServiceImpl implements DocumentService {

    private final DocumentRepository documentRepository;
    private final ModelMapper modelMapper;

    public DocumentServiceImpl(DocumentRepository documentRepository, ModelMapper modelMapper) {
        this.documentRepository = documentRepository;
        this.modelMapper = modelMapper;
    }

    public void createDocument(DocumentDto documentDto) {
        documentRepository.save(mapToEntity(documentDto));
    }

    private Document mapToEntity(DocumentDto documentDto) {
        Document document = modelMapper.map(documentDto, Document.class);
        return document;
    }


}
