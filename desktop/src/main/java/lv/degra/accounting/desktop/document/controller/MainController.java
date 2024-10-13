package lv.degra.accounting.desktop.document.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Predicate;

import org.springframework.stereotype.Component;

import javafx.collections.ObservableList;
import javafx.event.ActionEvent;
import javafx.event.Event;
import javafx.fxml.FXML;
import javafx.scene.control.Button;
import javafx.scene.control.Tab;
import javafx.scene.control.TabPane;
import lv.degra.accounting.core.document.dto.DocumentDto;
import lv.degra.accounting.desktop.system.component.lazycombo.ControlWithErrorLabel;
import lv.degra.accounting.desktop.validation.ValidationFunction;
import lv.degra.accounting.desktop.validation.service.ValidationService;

@Component
public class MainController extends DocumentControllerComponent {

	@FXML
	public TabPane documentTabPane;
	@FXML
	public Tab documentInfoTab;
	@FXML
	public Tab billContentTab;
	@FXML
	public Button saveButton;
	@FXML
	public Button printButton;

	public Map<String, ValidationFunction> mainValidationFunctions = new HashMap<>();
	protected List<ControlWithErrorLabel<?>> mainValidationControls = new ArrayList<>();

	private DocumentDto documentDto;
	private ObservableList<DocumentDto> documentObservableList;

	public MainController(Mediator mediator, ValidationService validationService) {
		super(mediator, validationService);
		this.validationService = validationService;
	}

	@FXML
	public void initialize() {
		updateDocumentTabs();
	}

	@Override
	public ControlWithErrorLabel<String> getSumTotalField() {
		return null;
	}

	@Override
	public boolean validate() {
		return validateControllerControls(mainValidationControls);
	}

	@Override
	public void clearValidationControls() {
		mainValidationControls.clear();
	}

	public void billContentOpenAction(Event event) {
	}

	@FXML
	public void onSaveDocumentButton() {
		if (mediator.validateDocument() && mediator.saveDocument()) {
			closeWindows();
		}
	}

	public void onPrintDocumentButton(ActionEvent actionEvent) {
	}

	public void updateDocumentTabs() {
		if (documentDto != null && documentDto.isBill()) {
			showBillTab();
		} else {
			hideBillTab();
		}
	}

	public void hideBillTab() {
		documentTabPane.getTabs().remove(billContentTab);
	}

	public void showBillTab() {
		if (!documentTabPane.getTabs().contains(billContentTab)) {
			documentTabPane.getTabs().add(billContentTab);
		}
	}

	public void disableDocumentButtons() {
		changeDocumentButtonStatus(true);
	}

	public void enableDocumentButtons() {
		changeDocumentButtonStatus(false);
	}

	protected void changeDocumentButtonStatus(boolean setDisable) {
		saveButton.setDisable(setDisable);
		closeButton.setDisable(setDisable);
	}

	public DocumentDto getDocumentDto() {
		return documentDto;
	}

	public void setDocumentDto(DocumentDto documentDto) {
		Integer documentSubtypeId = null;
		this.documentDto = documentDto;
		if (documentDto != null) {
			documentSubtypeId = documentDto.getDocumentSubType().getId();
			mediator.fillDocumentFormWithExistData(documentDto);
		}
		updateDocumentTabs();
	}

	public ObservableList<DocumentDto> getDocumentObservableList() {
		return documentObservableList;
	}

	public void setDocumentObservableList(ObservableList<DocumentDto> documentObservableList) {
		this.documentObservableList = documentObservableList;
	}

	public <T> void addValidationControl(ControlWithErrorLabel<T> control, Predicate<T> validationCondition, String errorMessage) {
		control.setValidationCondition(validationCondition, errorMessage);
		mainValidationControls.add(control);
	}

	public void switchToDocumentInfoTab() {
		documentTabPane.getSelectionModel().select(documentInfoTab);
	}

}
