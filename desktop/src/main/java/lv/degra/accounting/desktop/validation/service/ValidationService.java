package lv.degra.accounting.desktop.validation.service;

import java.util.List;

import lv.degra.accounting.core.validation.model.ValidationRule;
import lv.degra.accounting.desktop.document.controllerv.DocumentControllerComponent;

public interface ValidationService {
	List<ValidationRule> getValidationRulesByDocumentSybType(Integer documentSubtypeId);

	void applyRequiredValidation(ValidationRule validationRule, DocumentControllerComponent controller);

	void applyCustomValidation(ValidationRule validationRule, DocumentControllerComponent controller);

	void applyValidationRulesByDocumentSubType(DocumentControllerComponent infoController, int documentSubTypeId);

	<T, C> T getFieldByName(C controller, String fieldName);
}
