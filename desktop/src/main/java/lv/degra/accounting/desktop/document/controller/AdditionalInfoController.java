package lv.degra.accounting.desktop.document.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Predicate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javafx.application.Platform;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.fxml.FXML;
import javafx.scene.control.TableColumn;
import lombok.Getter;
import lombok.Setter;
import lv.degra.accounting.core.account.chart.service.AccountCodeChartService;
import lv.degra.accounting.core.account.posted.dto.AccountPostedDto;
import lv.degra.accounting.core.account.posted.service.AccountPostedService;
import lv.degra.accounting.core.account.posted.service.exception.AccountPostedDeletionException;
import lv.degra.accounting.core.document.dto.DocumentDto;
import lv.degra.accounting.desktop.system.component.TextAreaWithErrorLabel;
import lv.degra.accounting.desktop.system.component.lazycombo.ControlWithErrorLabel;
import lv.degra.accounting.desktop.system.component.tableView.DynamicTableView;
import lv.degra.accounting.desktop.validation.ValidationFunction;
import lv.degra.accounting.desktop.validation.service.ValidationService;

@Component
@Setter
@Getter
public class AdditionalInfoController extends DocumentControllerComponent {

	private final AccountPostedService accountPostedService;
	private final ObservableList<AccountPostedDto> accountPostedDtoObservableList = FXCollections.observableArrayList();
	private final AccountCodeChartService accountCodeChartService;
	@FXML
	@Getter
	@Setter
	public TextAreaWithErrorLabel notesForCustomerField;
	@FXML
	@Getter
	@Setter
	public TextAreaWithErrorLabel internalNotesField;
	@Autowired
	@FXML
	public DynamicTableView<AccountPostedDto> postingListView = new DynamicTableView<>();
	private Map<String, ValidationFunction> additionalInfoValidationFunctions = new HashMap<>();
	private List<ControlWithErrorLabel<?>> additionalInfoValidationControls = new ArrayList<>();
	@Autowired
	private InfoController infoController;

	public AdditionalInfoController(AccountPostedService accountPostedService, Mediator mediator, ValidationService validationService,
			AccountCodeChartService accountCodeChartService) {
		super(mediator, validationService);
		this.accountPostedService = accountPostedService;
		this.accountCodeChartService = accountCodeChartService;
		this.mediator = mediator;
	}

	@FXML
	private void initialize() {
		additionalInfoValidationControls.clear();
		accountPostedDtoObservableList.clear();
		postingListView.setEditable(true);
		postingListView.setType(AccountPostedDto.class);
		postingListView.setCreator(item -> {
			addRecord();
			editRecord();
		});
		postingListView.setUpdater(item -> editRecord());
		postingListView.setSaver(item -> saveRecord());
		postingListView.setDeleter(item -> {
			deleteRecord();
			refreshAccountPostingTable();
		});

		notesForCustomerField.setOnKeyPressed(event -> {
			if (event.getCode().equals(javafx.scene.input.KeyCode.TAB)) {
				event.consume();
				internalNotesField.requestFocus();
			}
		});

		internalNotesField.setOnKeyPressed(event -> {
			if (event.getCode().equals(javafx.scene.input.KeyCode.TAB)) {
				event.consume();
			}
		});

	}

	@Override
	protected void saveRecord() {
		AccountPostedDto selectedItem = postingListView.getSelectionModel().getSelectedItem();
		if (selectedItem != null) {
			selectedItem.setDocumentDto(mediator.getEditableDocumentDto());
			List<AccountPostedDto> accountPostedDtoList = mediator.getEditableDocumentDto().getAccountPostedList();
			if (accountPostedDtoList == null) {
				accountPostedDtoList = new ArrayList<>();
			} else {
				accountPostedDtoList = new ArrayList<>(accountPostedDtoList);
			}
			int index = accountPostedDtoList.indexOf(selectedItem);
			if (index >= 0) {
				accountPostedDtoList.set(index, selectedItem);
			} else {
				accountPostedDtoList.add(selectedItem);
			}
			mediator.getEditableDocumentDto().setAccountPostedList(accountPostedDtoList);
			refreshAccountPostingTable();
		}
	}

	@Override
	protected void editRecord() {
		if (postingListView.getItems().isEmpty()) {
			addRecord();
		}
		Platform.runLater(() -> {
			int rowIndex = postingListView.getSelectionModel().getSelectedIndex();
			if (rowIndex >= 0) {
				postingListView.getColumns().stream().filter(TableColumn::isEditable)
						.findFirst().ifPresent(firstEditableColumn -> postingListView.edit(rowIndex, firstEditableColumn));

			}
		});

	}

	@Override
	protected void addRecord() {
		AccountPostedDto accountPostedDto = new AccountPostedDto();
		accountPostedDto.setDocumentDto(mediator.getEditableDocumentDto());
		accountPostedDtoObservableList.add(accountPostedDto);
		postingListView.setData(accountPostedDtoObservableList);
		postingListView.getSelectionModel().select(accountPostedDto);
	}

	@Override
	public void clearValidationControls() {
		additionalInfoValidationControls.clear();
	}

	@Override
	public boolean validate() {
		return validateControllerControls(additionalInfoValidationControls);
	}

	@Override
	protected void deleteRecord() {
		AccountPostedDto accountPostedDto = getRowFromTableView(postingListView);
		if (accountPostedDto == null || accountPostedDto.getId() == null) {
			return;
		}
		try {
			postingListView.getItems().removeAll(accountPostedDto);
			List<AccountPostedDto> accountPostedDtos = new ArrayList<>(mediator.getEditableDocumentDto().getAccountPostedList());
			accountPostedDtos.remove(accountPostedDto);
			mediator.getEditableDocumentDto().setAccountPostedList(accountPostedDtos);
		} catch (RuntimeException e) {
			throw new AccountPostedDeletionException("Failed to delete Account Posted with ID: " + accountPostedDto.getId(), e);
		}
	}

	@Override
	public void getData(DocumentDto documentDto) {
		documentDto.setNotesForCustomer(notesForCustomerField.getText());
		documentDto.setInternalNotes(internalNotesField.getText());
		accountPostedDtoObservableList
				.forEach(accountPostedDto -> accountPostedDto.setDocumentDto(documentDto));
		documentDto.setAccountPostedList(accountPostedDtoObservableList);
	}

	@Override
	public void setData(DocumentDto documentDto) {
		notesForCustomerField.setText(documentDto.getNotesForCustomer());
		internalNotesField.setText(documentDto.getInternalNotes());
		refreshAccountPostingTable();
	}

	protected void setControllerObjectsValidationRulesByDocumentSubtype(int documentSubTypeId) {
		validationService.applyValidationRulesByDocumentSubType(this, documentSubTypeId);
	}

	protected boolean validateAccountPostsList() {
		return postingListView.validate();
	}

	public void onAddAccountingRowButton() {
		addRecord();
		editRecord();
	}

	private void refreshAccountPostingTable() {
		accountPostedDtoObservableList.clear();
		if (mediator.getEditableDocumentDto() != null && !mediator.getEditableDocumentDto().getAccountPostedList().isEmpty()) {
			accountPostedDtoObservableList.addAll(mediator.getEditableDocumentDto().getAccountPostedList());
			postingListView.setData(accountPostedDtoObservableList);
		}
	}

	public <T> void addValidationControl(ControlWithErrorLabel<T> control, Predicate<T> validationCondition, String errorMessage) {
		control.setValidationCondition(validationCondition, errorMessage);
		additionalInfoValidationControls.add(control);
	}
}
