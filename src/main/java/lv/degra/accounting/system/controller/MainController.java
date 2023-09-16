package lv.degra.accounting.system.controller;

import javafx.fxml.FXML;
import javafx.scene.layout.BorderPane;
import lv.degra.accounting.system.utils.DegraFormBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Controller;

import java.io.IOException;

@Controller
public class MainController {

    private static final String DOCUMENT_LIST_SCREEN_FILE = "/document/documentList.fxml";
    @FXML
    public BorderPane mainBorderPane;
    @Autowired
    DegraFormBuilder degraFormBuilder;

    @Autowired
    ApplicationContext context;

    public void createNewDocument() throws IOException {
        degraFormBuilder.buildScene("/document/document.fxml", "Pievienot jaunu dokumentu");
    }

    public void openDocumentList() throws IOException {
        mainBorderPane.setCenter(degraFormBuilder.loadFxml(DOCUMENT_LIST_SCREEN_FILE));
    }
}
