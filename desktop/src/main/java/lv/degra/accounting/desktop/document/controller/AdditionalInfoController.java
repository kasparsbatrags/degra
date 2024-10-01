package lv.degra.accounting.desktop.document.controller;

import org.springframework.stereotype.Component;

import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.fxml.FXML;
import lombok.Getter;
import lombok.Setter;
import lv.degra.accounting.core.account.distribution.dto.AccountCodeDistributionDto;
import lv.degra.accounting.core.account.distribution.service.DistributionService;
import lv.degra.accounting.core.document.dto.DocumentDto;
import lv.degra.accounting.desktop.system.component.DynamicTableView;
import lv.degra.accounting.desktop.system.component.TextAreaWithErrorLabel;
import lv.degra.accounting.desktop.system.utils.DegraController;

@Component
@Setter
@Getter
public class AdditionalInfoController extends DegraController {

	private final ObservableList<AccountCodeDistributionDto> distributionDtoObservableList = FXCollections.observableArrayList();
	private final DistributionService distributionService;
	private final Mediator mediator;
	@FXML
	@Getter
	@Setter
	public TextAreaWithErrorLabel notesForCustomerField;
	@FXML
	@Getter
	@Setter
	public TextAreaWithErrorLabel internalNotesField;
	DocumentDto documentDto;
	private MainController mainController;
	@FXML
	private DynamicTableView<AccountCodeDistributionDto> distributionListView = new DynamicTableView<>();

	public AdditionalInfoController(DistributionService distributionService, Mediator mediator) {
		this.distributionService = distributionService;
		this.mediator = mediator;
	}

	@FXML
	private void initialize() {

		distributionListView.setType(AccountCodeDistributionDto.class);
		distributionListView.setCreator(item -> {
			addRecord();
			refreshTable();
		});
		distributionListView.setUpdater(item -> editRecord());
		distributionListView.setDeleter(item -> {
			deleteRecord();
			refreshTable();
		});

		refreshTable();

		notesForCustomerField.setOnKeyPressed(event -> {
			if (event.getCode().equals(javafx.scene.input.KeyCode.TAB)) {
				event.consume();
				internalNotesField.requestFocus();
			}
		});

		internalNotesField.setOnKeyPressed(event -> {
			if (event.getCode().equals(javafx.scene.input.KeyCode.TAB)) {
				event.consume();
				mainController.saveButton.requestFocus();
			}
		});

	}

	private void refreshTable() {
		if (mainController != null) {
			distributionDtoObservableList.clear();
			distributionDtoObservableList.addAll(
					distributionService.getDistributionByDocumentId(mainController.getDocumentDto().getId()));
			distributionListView.setData(distributionDtoObservableList);
		}
	}

	public void onAddAccountingRowButton() {
		documentDto = mediator.getDocumentDto();
	}

	public DocumentDto getAdditionalInfoData(DocumentDto documentDto) {
		documentDto.setNotesForCustomer(notesForCustomerField.getText());
		documentDto.setInternalNotes(internalNotesField.getText());
		return documentDto;
	}

	public void fillDocumentFormWithExistData(DocumentDto documentDto) {
		notesForCustomerField.setText(documentDto.getNotesForCustomer());
		internalNotesField.setText(documentDto.getInternalNotes());
	}
}
