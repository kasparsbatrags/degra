package lv.degra.accounting.document.controller;

import java.io.IOException;
import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Controller;

import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.control.Button;
import javafx.scene.control.TableColumn;
import javafx.scene.input.KeyCode;
import javafx.scene.input.KeyEvent;
import javafx.stage.Modality;
import javafx.stage.Stage;
import lv.degra.accounting.document.dto.DocumentDto;
import lv.degra.accounting.document.enums.DocumentDirection;
import lv.degra.accounting.document.model.Document;
import lv.degra.accounting.document.service.DocumentService;
import lv.degra.accounting.system.alert.AlertAsk;
import lv.degra.accounting.system.alert.AlertResponseType;
import lv.degra.accounting.system.exception.FxmlFileLoaderException;
import lv.degra.accounting.system.object.DynamicTableView;
import lv.degra.accounting.system.utils.ApplicationFormBuilder;
import lv.degra.accounting.system.utils.DegraController;

@Controller
public class DocumentListController extends DegraController {

	private static final String DOCUMENT_SCREEN_FILE = "/document/document.fxml";
	private static final String EDIT_DOCUMENT_TITLE = "Rediģēt dokumentu";
	private static final String CRATE_DOCUMENT_TITLE = "Izveidot dokumentu";
	private static final String DELETE_QUESTION_HEADER_TEXT = "Dzēst ierakstu";
	private static final String DELETE_QUESTION_CONTEXT_TEXT = "Vai tiešām vēlaties dzēst ierakstu?";
	@FXML
	public Button newButton;
	@Autowired
	private ApplicationFormBuilder applicationFormBuilder;
	@Autowired
	private ApplicationContext context;
	private ObservableList<Document> documentObservableList = FXCollections.observableArrayList();
	@Autowired
	private DocumentService documentService;
	@FXML
	private DynamicTableView<Document> documentDynamicTableView = new DynamicTableView<>();
	@FXML
	private TableColumn<Document, LocalDate> documentDateColumn;
	@FXML
	private TableColumn<Document, String> documentNumberColumn;
	@FXML
	private TableColumn<Document, String> documentTypeColumn;
	@FXML
	private TableColumn<Document, DocumentDirection> documentDirectionColumn;
	@FXML
	private TableColumn<Document, Double> sumTotalColumn;
	@FXML
	private TableColumn<Document, String> currencyColumn;
	@FXML
	private TableColumn<Document, String> exchangeRateColumn;
	@FXML
	private TableColumn<Document, String> sumTotalInCurrencyColumn;

	@FXML
	public void initialize() {
		loadData();
	}

	public void onNewButton() {
		openDocumentEditForm(null);
	}

	private void refreshTable() {
		documentObservableList.clear();
		documentObservableList.addAll(documentService.getDocumentList());
//		documentTableView.setItems(documentObservableList);
		documentDynamicTableView.setData(documentObservableList);
	}

	private void loadData() {
		refreshTable();
//		documentDateColumn.setCellValueFactory(new PropertyValueFactory<Document, LocalDate>("documentDate"));
//		documentNumberColumn.setCellValueFactory(new Callback<TableColumn.CellDataFeatures<Document, String>, ObservableValue<String>>() {
//			@Override
//			public ObservableValue<String> call(
//					TableColumn.CellDataFeatures<Document, String> p) {
//				return new SimpleStringProperty(p.getValue().getDocumentSeries()
//						+ "-" + p.getValue().getDocumentNumber().toString());
//			}
//		});
//
//		documentDirectionColumn.setCellValueFactory(new PropertyValueFactory<Document, DocumentDirection>("direction"));
//		documentDirectionColumn.setCellFactory(new DirectionEnumCellFactory());
//
//		sumTotalColumn.setCellValueFactory(new PropertyValueFactory<Document, Double>("sumTotal"));
//		currencyColumn.setCellValueFactory(doc -> new SimpleStringProperty(doc.getValue().getCurrency().getCurrencyCode()));
//		documentTypeColumn.setCellValueFactory(doc -> new SimpleStringProperty(doc.getValue().getDocumentType().getName()));
//		exchangeRateColumn.setCellValueFactory(
//				doc -> new SimpleStringProperty(etdoc.getValue().getExchangeRate().getRate().toString()));
//
//		documentTableView.requestFocus();
	}

	@FXML
	public void onKeyPressAction(KeyEvent keyEvent) {
		Document document;
		KeyCode key = keyEvent.getCode();
		if (key == KeyCode.INSERT) {
			openDocumentEditForm(null);
		} else if (key == KeyCode.ENTER) {
			document = getDocumentFromTableView(documentDynamicTableView);
			if (document == null) {
				return;
			}
			openDocumentEditForm(documentService.mapToDto(document));
		} else if (key == KeyCode.DELETE) {
			if (new AlertAsk(DELETE_QUESTION_HEADER_TEXT, DELETE_QUESTION_CONTEXT_TEXT).getAnswer().equals(AlertResponseType.NO)) {
				return;
			}
			document = getDocumentFromTableView(documentDynamicTableView);
			if (document == null) {
				return;
			}
			documentService.deleteDocumentById(document.getId());
			documentDynamicTableView.getItems().removeAll(documentDynamicTableView.getSelectionModel().getSelectedItem());
		}
	}

	private Document getDocumentFromTableView(javafx.scene.control.TableView<Document> documentTableView) {
		return documentTableView.getSelectionModel().getSelectedItem();
	}

	private void openDocumentEditForm(DocumentDto documentDto) {
		FXMLLoader fxmlLoader = new FXMLLoader(getClass().getResource(DOCUMENT_SCREEN_FILE));
		fxmlLoader.setControllerFactory(context::getBean);
		try {
			fxmlLoader.load();
			Parent root1 = fxmlLoader.getRoot();
			Stage stage = applicationFormBuilder.getApplicationFormatedStage(root1,
					documentDto == null ? CRATE_DOCUMENT_TITLE : EDIT_DOCUMENT_TITLE);
			DocumentController documentController = fxmlLoader.getController();
			if (isCreateNewDocument(documentDto)) {
				documentController.setDocumentList(documentObservableList);
			} else {
				documentController.setDocumentList(documentObservableList);
				documentController.setDocument(documentDto);
			}
			stage.initModality(Modality.WINDOW_MODAL);
			stage.setMaximized(true);
			stage.showAndWait();
			if (!isCreateNewDocument(documentDto)) {
				loadData();
			}
		} catch (RuntimeException | IOException e) {
			throw new FxmlFileLoaderException(e.getMessage());
		}
	}

	private boolean isCreateNewDocument(DocumentDto documentDto) {
		return documentDto == null;
	}
}