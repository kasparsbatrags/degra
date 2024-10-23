package lv.degra.accounting.desktop.document.controller;

import static org.apache.commons.lang3.StringUtils.EMPTY;

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
import lv.degra.accounting.desktop.system.component.Label;
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
	@FXML
	public Label documentIdLabel;
	protected List<ControlWithErrorLabel<?>> mainValidationControls = new ArrayList<>();
	private ObservableList<DocumentDto> documentObservableList;

	public MainController(Mediator mediator, ValidationService validationService) {
		super(mediator, validationService);
		this.validationService = validationService;
	}

	@FXML
	public void onSaveDocumentButton() {
		if (mediator.validateDocument() && mediator.saveDocument()) {
			closeWindows();
		}
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

	@Override
	public void getData(DocumentDto documentDto) {
		documentDto.setId(documentIdLabel.getText().isEmpty() ? null : Integer.parseInt(documentIdLabel.getText()));
	}

	@Override
	public void setData(DocumentDto documentDto) {
		documentIdLabel.setText(documentDto.getId() != null ? documentDto.getId().toString() : EMPTY);
	}


	public void onPrintDocumentButton(ActionEvent actionEvent) {
	}

	public void updateDocumentTabs() {
		if (mediator.getEditableDocumentDto() != null && mediator.getEditableDocumentDto().isBill()) {
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

	public void setDocumentDto(DocumentDto documentDto) {
		mediator.setDocumentDto(documentDto);
		if (documentDto.getId() != null) {
			mediator.setData();
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
