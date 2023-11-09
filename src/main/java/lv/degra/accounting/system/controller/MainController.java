package lv.degra.accounting.system.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Controller;

import javafx.fxml.FXML;
import javafx.scene.control.Button;
import javafx.scene.layout.BorderPane;
import lv.degra.accounting.system.utils.ApplicationFormBuilder;

@Controller
public class MainController {

	private static final String DOCUMENT_LIST_SCREEN_FILE = "/document/documentList.fxml";
	@FXML
	public BorderPane mainBorderPane;
	public Button documentsButton;
	@Autowired
	ApplicationFormBuilder applicationFormBuilder;

	@Autowired
	ApplicationContext context;

	public void openDocumentList() {
		mainBorderPane.setCenter(applicationFormBuilder.loadFxml(DOCUMENT_LIST_SCREEN_FILE));
		mainBorderPane.requestFocus();
	}
}
