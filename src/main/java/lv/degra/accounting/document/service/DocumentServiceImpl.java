package lv.degra.accounting.document.service;

import lv.degra.accounting.document.Dto.DocumentDto;
import lv.degra.accounting.document.model.Document;
import lv.degra.accounting.document.model.DocumentRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class DocumentServiceImpl implements DocumentService {

    @Autowired
    private DocumentRepository documentRepository;
    @Autowired
    private ModelMapper modelMapper;

    public void createDocument(DocumentDto documentDto) {
        documentRepository.save(mapToEntity(documentDto));
    }

    private Document mapToEntity(DocumentDto documentDto) {
        Document document = modelMapper.map(documentDto, Document.class);
        return document;
    }


}
