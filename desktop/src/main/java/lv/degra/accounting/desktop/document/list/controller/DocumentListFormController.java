package lv.degra.accounting.desktop.document.list.controller;

import static javafx.stage.Modality.APPLICATION_MODAL;
import static lv.degra.accounting.desktop.system.configuration.DegraDesktopConfig.CRATE_FORM_TITLE;
import static lv.degra.accounting.desktop.system.configuration.DegraDesktopConfig.EDIT_FORM_TITLE;

import java.util.Objects;

import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Controller;

import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.control.Button;
import javafx.stage.Stage;
import lombok.extern.slf4j.Slf4j;
import lv.degra.accounting.core.document.bill.service.BillRowService;
import lv.degra.accounting.core.document.dto.DocumentDto;
import lv.degra.accounting.core.document.service.DocumentService;
import lv.degra.accounting.core.document.service.exception.DocumentDeletionException;
import lv.degra.accounting.desktop.document.controller.DocumentMediator;
import lv.degra.accounting.desktop.document.controller.MainController;
import lv.degra.accounting.desktop.system.component.DynamicTableView;
import lv.degra.accounting.desktop.system.exception.DegraRuntimeException;
import lv.degra.accounting.desktop.system.utils.ApplicationFormBuilder;
import lv.degra.accounting.desktop.system.utils.DegraController;
@Slf4j
@Controller
public class DocumentListFormController extends DegraController {

	private static final String DOCUMENT_SCREEN_FILE = "/document/DocumentMainForm.fxml";
	private final ObservableList<DocumentDto> documentObservableList = FXCollections.observableArrayList();
	private final ApplicationFormBuilder applicationFormBuilder;
	private final ApplicationContext context;
	private final DocumentService documentService;
	private final BillRowService billRowService;
	private final DocumentMediator documentMediator;

	@FXML
	public Button newButton;
	@FXML
	private DynamicTableView<DocumentDto> documentListView = new DynamicTableView<>();

	public DocumentListFormController(ApplicationFormBuilder applicationFormBuilder, ApplicationContext context,
			DocumentService documentService, BillRowService billRowService, DocumentMediator documentMediator) {
		super();
		this.applicationFormBuilder = applicationFormBuilder;
		this.context = context;
		this.documentService = documentService;
		this.billRowService = billRowService;
		this.documentMediator = documentMediator;
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
		addRecord();
	}

	private void refreshTable() {
		documentObservableList.clear();
		documentObservableList.addAll(documentService.getDocumentList());
		documentListView.setData(documentObservableList);
	}

	@Override
	protected void addRecord() {
		DocumentDto documentDto = new DocumentDto();
		documentMediator.startEditing(documentDto);
		openDocumentEditForm(documentDto);
	}

	@Override
	protected void editRecord() {
		DocumentDto documentDto = getRowFromTableView(documentListView);
		if (documentDto == null) {
			return;
		}
		documentMediator.startEditing(documentDto);
		openDocumentEditForm(documentMediator.getEditableDocument());
	}

	@Override
	protected void deleteRecord() {
		DocumentDto deletedDocumentDto = getRowFromTableView(documentListView);
		if (deletedDocumentDto == null || deletedDocumentDto.getId() == null) {
			return;
		}
		try {
			billRowService.deleteByDocumentId(deletedDocumentDto.getId());
			documentService.deleteById(deletedDocumentDto.getId());
			documentListView.getItems().remove(deletedDocumentDto);
		} catch (RuntimeException e) {

			throw new DocumentDeletionException("Failed to delete document with ID: " + deletedDocumentDto.getId(), e);
		}
	}

	private void openDocumentEditForm(DocumentDto documentDto) {
		FXMLLoader fxmlLoader = new FXMLLoader(getClass().getResource(DOCUMENT_SCREEN_FILE));
		fxmlLoader.setControllerFactory(context::getBean);
		try {
			Parent root1 = fxmlLoader.load();
			Stage stage = applicationFormBuilder.getApplicationFormatedStage(root1,
					isCreateNewDocument(documentDto) ? CRATE_FORM_TITLE : EDIT_FORM_TITLE);
			MainController mainController = fxmlLoader.getController();
			if (isCreateNewDocument(documentDto)) {
				mainController.setDocumentObservableList(documentObservableList);
			} else {
				mainController.setDocumentObservableList(documentObservableList);
				mainController.setDocumentDto(documentDto);
			}

			stage.setMaximized(true);
			stage.initModality(APPLICATION_MODAL);
			stage.showAndWait();
			refreshTable();
		} catch (RuntimeException ex) {
			Throwable rootCause = ex.getCause();
			Objects.requireNonNullElse(rootCause, ex);
			log.error(ex.toString(), rootCause);
		} catch (Exception e) {
			throw new DegraRuntimeException(e.getMessage(), e);
		}
	}

	private boolean isCreateNewDocument(DocumentDto documentDto) {
		return documentDto == null;
	}
}