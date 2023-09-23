package lv.degra.accounting.system.controller;

import javafx.fxml.FXML;
import javafx.scene.layout.BorderPane;
import lv.degra.accounting.system.utils.ApplicationFormBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Controller;

import java.io.IOException;

@Controller
public class MainController {

    private static final String DOCUMENT_LIST_SCREEN_FILE = "/document/documentList.fxml";
    private static final String DOCUMENT_SCREEN_FILE = "/document/document.fxml";
    @FXML
    public BorderPane mainBorderPane;
    @Autowired
    ApplicationFormBuilder applicationFormBuilder;

    @Autowired
    ApplicationContext context;

    public void createNewDocument() throws IOException {
        applicationFormBuilder.buildScene(DOCUMENT_SCREEN_FILE, "Pievienot jaunu dokumentu");
    }

    public void openDocumentList() throws IOException {
        mainBorderPane.setCenter(applicationFormBuilder.loadFxml(DOCUMENT_LIST_SCREEN_FILE));
    }
}
