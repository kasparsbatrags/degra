package lv.degra.accounting.desktop.document.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Predicate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.fxml.FXML;
import lombok.Getter;
import lombok.Setter;
import lv.degra.accounting.core.account.chart.service.AccountCodeChartService;
import lv.degra.accounting.core.account.distribution.dto.AccountCodeDistributionDto;
import lv.degra.accounting.core.account.distribution.service.DistributionService;
import lv.degra.accounting.core.account.distribution.service.exception.AccountDistributionDeletionException;
import lv.degra.accounting.core.document.dto.DocumentDto;
import lv.degra.accounting.desktop.system.component.DynamicTableView;
import lv.degra.accounting.desktop.system.component.TextAreaWithErrorLabel;
import lv.degra.accounting.desktop.system.component.lazycombo.ControlWithErrorLabel;
import lv.degra.accounting.desktop.validation.ValidationFunction;
import lv.degra.accounting.desktop.validation.service.ValidationService;

@Component
@Setter
@Getter
public class AdditionalInfoController extends DocumentControllerComponent {

	private final DistributionService distributionService;
	private final ObservableList<AccountCodeDistributionDto> accountCodeDistributionDtoObservableList = FXCollections.observableArrayList();
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
	public DynamicTableView<AccountCodeDistributionDto> distributionListView;
	private Map<String, ValidationFunction> additionalInfoValidationFunctions = new HashMap<>();
	private List<ControlWithErrorLabel<?>> additionalInfoValidationControls = new ArrayList<>();

	public AdditionalInfoController(DistributionService distributionService, Mediator mediator, ValidationService validationService,
			AccountCodeChartService accountCodeChartService) {
		super(mediator, validationService);
		this.distributionService = distributionService;
		this.accountCodeChartService = accountCodeChartService;
		this.mediator = mediator;
	}

	@FXML
	private void initialize() {
		distributionListView.setType(AccountCodeDistributionDto.class);
		distributionListView.setCreator(item -> {
			addRecord();
			refreshDistributionTable();
		});
		distributionListView.setUpdater(item -> editRecord());
		distributionListView.setDeleter(item -> {
			deleteRecord();
			refreshDistributionTable();
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
				//				mainController.saveButton.requestFocus();
			}
		});

	}

	protected void addRecord() {
		AccountCodeDistributionDto accountCodeDistributionDto = new AccountCodeDistributionDto();
		distributionListView.getItems().add(accountCodeDistributionDto);
		distributionListView.getSelectionModel().select(accountCodeDistributionDto);
	}

	@Override
	public ControlWithErrorLabel<String> getSumTotalField() {
		return null;
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
		AccountCodeDistributionDto accountCodeDistributionDto = getRowFromTableView(distributionListView);
		if (accountCodeDistributionDto == null || accountCodeDistributionDto.getId() == null) {
			return;
		}
		try {
			distributionListView.getItems().removeAll(accountCodeDistributionDto);
			List<AccountCodeDistributionDto> distributionList = new ArrayList<>(mediator.getEditableDocumentDto().getAccountCodeDistributionDtoList());
			distributionList.remove(accountCodeDistributionDto);
			mediator.getEditableDocumentDto().setAccountCodeDistributionDtoList(distributionList);
		} catch (RuntimeException e) {
			throw new AccountDistributionDeletionException("Failed to delete distribution with ID: " + accountCodeDistributionDto.getId(),
					e);
		}
	}

	@Override
	public void getData(DocumentDto documentDto) {
		documentDto.setNotesForCustomer(notesForCustomerField.getText());
		documentDto.setInternalNotes(internalNotesField.getText());
		documentDto.setAccountCodeDistributionDtoList(accountCodeDistributionDtoObservableList);
	}

	@Override
	public void setData(DocumentDto documentDto) {
		notesForCustomerField.setText(documentDto.getNotesForCustomer());
		internalNotesField.setText(documentDto.getInternalNotes());
		refreshDistributionTable();
	}

	public void onAddAccountingRowButton() {
	}

	private void refreshDistributionTable() {
		accountCodeDistributionDtoObservableList.clear();
		if (mediator.getEditableDocumentDto() != null) {
			accountCodeDistributionDtoObservableList.addAll(mediator.getEditableDocumentDto().getAccountCodeDistributionDtoList());
			distributionListView.setData(accountCodeDistributionDtoObservableList);
		}
	}

	public <T> void addValidationControl(ControlWithErrorLabel<T> control, Predicate<T> validationCondition, String errorMessage) {
		control.setValidationCondition(validationCondition, errorMessage);
		additionalInfoValidationControls.add(control);
	}
}
