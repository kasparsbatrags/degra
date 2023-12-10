package lv.degra.accounting.document.controller;

import static javafx.stage.Modality.APPLICATION_MODAL;
import static lv.degra.accounting.configuration.DegraConfig.CRATE_FORM_TITLE;
import static lv.degra.accounting.configuration.DegraConfig.EDIT_FORM_TITLE;

import java.io.IOException;

import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Controller;

import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.control.Button;
import javafx.stage.Stage;
import lv.degra.accounting.document.bill.service.BillRowService;
import lv.degra.accounting.document.dto.DocumentDto;
import lv.degra.accounting.document.service.DocumentService;
import lv.degra.accounting.system.exception.FxmlFileLoaderException;
import lv.degra.accounting.system.object.DynamicTableView;
import lv.degra.accounting.system.utils.ApplicationFormBuilder;
import lv.degra.accounting.system.utils.DegraController;

@Controller
public class DocumentListFormController extends DegraController {

	private static final String DOCUMENT_SCREEN_FILE = "/document/document.fxml";
	private final ObservableList<DocumentDto> documentObservableList = FXCollections.observableArrayList();
	private final ApplicationFormBuilder applicationFormBuilder;
	private final ApplicationContext context;
	private final DocumentService documentService;
	private final BillRowService billRowService;

	@FXML
	public Button newButton;
	@FXML
	private DynamicTableView<DocumentDto> documentListView = new DynamicTableView<>();
	public DocumentListFormController(ApplicationFormBuilder applicationFormBuilder, ApplicationContext context,
			DocumentService documentService, BillRowService billRowService) {
		this.applicationFormBuilder = applicationFormBuilder;
		this.context = context;
		this.documentService = documentService;
		this.billRowService = billRowService;
	}

	@FXML
	public void initialize() {
		documentListView.setType(DocumentDto.class);
		documentListView.setCreator(item -> {
			addRecord();
			refreshTable();
		});
		documentListView.setUpdater(item -> editRecord());
		documentListView.setDeleter(item -> {
			deleteRecord();
			refreshTable();
		});

		refreshTable();
	}

	public void onNewButton() {
		openDocumentEditForm(null);
	}

	private void refreshTable() {
		documentObservableList.clear();
		documentObservableList.addAll(documentService.getDocumentList());
		documentListView.setData(documentObservableList);
	}

	@Override
	protected void addRecord() {
		openDocumentEditForm(null);
	}

	@Override
	protected void editRecord() {
		DocumentDto newDocumentDto = getRowFromTableView(documentListView);
		if (newDocumentDto == null) {
			return;
		}
		openDocumentEditForm(newDocumentDto);
	}

	@Override
	protected void deleteRecord() {
		DocumentDto newDocumentDto = getRowFromTableView(documentListView);
		if (newDocumentDto == null) {
			return;
		}
		billRowService.deleteBillRowById(newDocumentDto.getId());
		documentService.deleteDocumentById(newDocumentDto.getId());
		documentListView.getItems().removeAll(newDocumentDto);
	}

	private void openDocumentEditForm(DocumentDto documentDto) {
		FXMLLoader fxmlLoader = new FXMLLoader(getClass().getResource(DOCUMENT_SCREEN_FILE));
		fxmlLoader.setControllerFactory(context::getBean);
		try {
			fxmlLoader.load();
			Parent root1 = fxmlLoader.getRoot();
			Stage stage = applicationFormBuilder.getApplicationFormatedStage(root1,
					documentDto == null ? CRATE_FORM_TITLE : EDIT_FORM_TITLE);
			DocumentFormController documentFormController = fxmlLoader.getController();
			if (isCreateNewDocument(documentDto)) {
				documentFormController.setDocumentList(documentObservableList);
			} else {
				documentFormController.setDocumentList(documentObservableList);
				documentFormController.setDocument(documentDto);
			}
			stage.setMaximized(true);
			stage.initModality(APPLICATION_MODAL);
			stage.showAndWait();
			if (!isCreateNewDocument(documentDto)) {
				refreshTable();
			}
		} catch (RuntimeException | IOException e) {
			throw new FxmlFileLoaderException(e.getMessage());
		}
	}

	private boolean isCreateNewDocument(DocumentDto documentDto) {
		return documentDto == null;
	}
}