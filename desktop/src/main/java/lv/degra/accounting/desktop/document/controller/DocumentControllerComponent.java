package lv.degra.accounting.desktop.document.controller;

import java.util.List;
import java.util.function.Predicate;

import javafx.scene.Node;
import lv.degra.accounting.core.account.posted.dto.AccountPostedDto;
import lv.degra.accounting.core.document.dto.DocumentDto;
import lv.degra.accounting.core.validation.model.ValidationRule;
import lv.degra.accounting.desktop.system.component.lazycombo.ControlWithErrorLabel;
import lv.degra.accounting.desktop.system.component.tableView.DynamicTableView;
import lv.degra.accounting.desktop.system.utils.DegraController;
import lv.degra.accounting.desktop.validation.service.ValidationService;

public abstract class DocumentControllerComponent extends DegraController {
	protected Mediator mediator;
	protected ValidationService validationService;

	public DocumentControllerComponent(Mediator mediator, ValidationService validationService) {
		super();
		this.mediator = mediator;
		this.validationService = validationService;
	}

	public void applyRequiredValidation(ValidationRule validationRule) {
		validationService.applyRequiredValidation(validationRule, this);
	}

	protected void applyCustomValidation(ValidationRule validationRule) {
		validationService.applyCustomValidation(validationRule, this);
	}

	public void refreshScreenControls(Integer documentSubtypeId) {

		List<ValidationRule> validationRuleList = validationService.getValidationRulesByDocumentSybType(documentSubtypeId);

		validationRuleList.forEach(rule -> {
			Object field = validationService.getFieldByName(this, rule.getValidationObject().getName());
			if (field instanceof ControlWithErrorLabel<?> control) {
				control.setVisible(rule.isShowInForm());
				control.setDisable(rule.isDefaultDisabled());
			} else if (field instanceof Node node) {
				node.setVisible(rule.isShowInForm());
				node.setDisable(rule.isDefaultDisabled());
			}
		});

	}

	protected boolean validateControllerControls(List<ControlWithErrorLabel<?>> validationControlList) {
		boolean allValid = true;
		for (ControlWithErrorLabel<?> control : validationControlList) {
			control.validate();
			if (!control.isValid()) {
				allValid = false;
			}
		}
		return allValid;
	}

	public ControlWithErrorLabel<String> getSumTotalField(){
		return mediator.getSumTotalField();
	}

	public DynamicTableView<AccountPostedDto> getPostingListView(){
		return mediator.getAccountPostedListView();
	}

	public void addTableViewValidationControl(DynamicTableView<AccountPostedDto> accountPostedDtoDynamicTableView, Predicate<DynamicTableView<?>> predicate, String errorMessage) {
		accountPostedDtoDynamicTableView.addValidationControl(predicate, errorMessage);
	}


	public abstract <T> void addValidationControl(ControlWithErrorLabel<T> control, Predicate<T> predicate, String errorMessage);

	public abstract void clearValidationControls();

	public abstract boolean validate();

	public abstract void getData(DocumentDto editableDocument);

	public abstract void setData(DocumentDto editableDocument);
}
