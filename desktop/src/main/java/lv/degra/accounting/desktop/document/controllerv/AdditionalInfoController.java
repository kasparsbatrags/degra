package lv.degra.accounting.desktop.document.controllerv;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Predicate;

import org.springframework.stereotype.Component;

import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.fxml.FXML;
import lombok.Getter;
import lombok.Setter;
import lv.degra.accounting.core.account.distribution.dto.AccountCodeDistributionDto;
import lv.degra.accounting.core.account.distribution.service.DistributionService;
import lv.degra.accounting.core.document.dto.DocumentDto;
import lv.degra.accounting.desktop.system.component.ControlWithErrorLabel;
import lv.degra.accounting.desktop.system.component.DynamicTableView;
import lv.degra.accounting.desktop.system.component.TextAreaWithErrorLabel;
import lv.degra.accounting.desktop.validation.ValidationFunction;
import lv.degra.accounting.desktop.validation.service.ValidationService;

@Component
@Setter
@Getter
public class AdditionalInfoController extends DocumentControllerComponent {

	private final DistributionService distributionService;
	private final ObservableList<AccountCodeDistributionDto> accountCodeDistributionDtoObservableList = FXCollections.observableArrayList();
	@FXML
	@Getter
	@Setter
	public TextAreaWithErrorLabel notesForCustomerField;
	@FXML
	@Getter
	@Setter
	public TextAreaWithErrorLabel internalNotesField;
	@FXML
	public DynamicTableView<AccountCodeDistributionDto> distributionListView = new DynamicTableView<>();
	private DocumentDto documentDto;
	private Map<String, ValidationFunction> additionalInfoValidationFunctions = new HashMap<>();
	private List<ControlWithErrorLabel<?>> additionalInfoValidationControls = new ArrayList<>();

	public AdditionalInfoController(DistributionService distributionService, Mediator mediator, ValidationService validationService) {
		super(mediator, validationService);
		this.distributionService = distributionService;
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

	public void onAddAccountingRowButton() {
		documentDto = mediator.getDocumentDto();
	}

	public DocumentDto getAdditionalInfoData(DocumentDto documentDto) {
		documentDto.setNotesForCustomer(notesForCustomerField.getText());
		documentDto.setInternalNotes(internalNotesField.getText());
		return documentDto;
	}

	public void setAdditionalInfoData(DocumentDto documentDto) {
		this.documentDto = documentDto;
		notesForCustomerField.setText(documentDto.getNotesForCustomer());
		internalNotesField.setText(documentDto.getInternalNotes());
		refreshDistributionTable();
	}

	private void refreshDistributionTable() {
		accountCodeDistributionDtoObservableList.clear();
		if (mediator.getDocumentDto() != null) {
			accountCodeDistributionDtoObservableList.addAll(
					distributionService.getDistributionByDocumentId(mediator.getDocumentDto().getId()));
			distributionListView.setData(accountCodeDistributionDtoObservableList);
		}
	}

	public <T> void addValidationControl(ControlWithErrorLabel<T> control, Predicate<T> validationCondition, String errorMessage) {
		control.setValidationCondition(validationCondition, errorMessage);
		additionalInfoValidationControls.add(control);
	}

}
