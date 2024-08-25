package lv.degra.accounting.desktop.system.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Controller;

import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.scene.control.Button;
import javafx.scene.layout.BorderPane;
import lv.degra.accounting.desktop.system.utils.ApplicationFormBuilder;

@Controller
public class MainController {

	private static final String DOCUMENT_LIST_SCREEN_FILE = "/document/DocumentListForm.fxml";
	private static final String SETTINGS_SCREEN_FILE = "/system/SettingsForm.fxml";
	@FXML
	public BorderPane mainBorderPane;
	@FXML
	public Button documentsButton;
	@Autowired
	ApplicationFormBuilder applicationFormBuilder;

	@Autowired
	ApplicationContext context;

	public void openDocumentList() {
		mainBorderPane.setCenter(applicationFormBuilder.loadFxml(DOCUMENT_LIST_SCREEN_FILE));
		mainBorderPane.requestFocus();
	}

	public void openSettings() {
		mainBorderPane.setCenter(applicationFormBuilder.loadFxml(SETTINGS_SCREEN_FILE));
		mainBorderPane.requestFocus();
	}
}
