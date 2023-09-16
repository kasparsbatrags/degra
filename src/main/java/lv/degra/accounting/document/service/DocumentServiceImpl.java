package lv.degra.accounting.document.service;

import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lv.degra.accounting.document.dto.DocumentDto;
import lv.degra.accounting.document.model.Document;
import lv.degra.accounting.document.model.DocumentRepository;
import lv.degra.accounting.system.exception.SaveDocumentException;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
@NoArgsConstructor
public class DocumentServiceImpl implements DocumentService {

    private static final String SAVE_EXCEPTION_MESSAGE = "Kļūda saglabājot dokumentu! ";
    @Autowired
    private DocumentRepository documentRepository;
    @Autowired
    private ModelMapper modelMapper;

    public void createDocument(DocumentDto documentDto) {
        try {
            documentRepository.save(mapToEntity(documentDto));
        } catch (RuntimeException exception) {
            throw new SaveDocumentException(SAVE_EXCEPTION_MESSAGE + exception.getMessage());
        }
    }


    public ObservableList<Document> getDocumentList() {
        return FXCollections.observableArrayList(documentRepository.findAll());
    }

    private Document mapToEntity(DocumentDto documentDto) {
        return modelMapper.map(documentDto, Document.class);
    }


}
