package lv.degra.accounting.desktop.document.controller;

import javafx.fxml.FXML;
import lv.degra.accounting.core.document.dto.DocumentDto;
import lv.degra.accounting.desktop.system.component.TextAreaWithErrorLabel;
import lv.degra.accounting.desktop.system.utils.DegraController;
import org.springframework.stereotype.Component;

@Component
public class DocumentAdditionalInfoController extends DegraController {
    @FXML
    public TextAreaWithErrorLabel notesForCustomerField;

    @FXML
    public TextAreaWithErrorLabel internalNotesField;


    DocumentDto documentDto;
    private final DocumentMainController documentMainController;
    private final DocumentInfoController documentInfoController;

    public DocumentAdditionalInfoController(DocumentInfoController documentInfoController, DocumentMainController documentMainController) {
        this.documentInfoController = documentInfoController;
        this.documentMainController = documentMainController;
    }

    @FXML
    private void initialize() {

        documentInfoController.injectAdditionalInfoController(this);

        notesForCustomerField.setOnKeyPressed(event -> {
            if (event.getCode().equals(javafx.scene.input.KeyCode.TAB)) {
                event.consume();
                internalNotesField.requestFocus();
            }
        });

        internalNotesField.setOnKeyPressed(event -> {
            if (event.getCode().equals(javafx.scene.input.KeyCode.TAB)) {
                event.consume();
                documentMainController.saveButton.requestFocus();
            }
        });

    }


    public void onAddAccountingRowButton() {
        documentDto = documentMainController.getDocumentDto();
    }
}
