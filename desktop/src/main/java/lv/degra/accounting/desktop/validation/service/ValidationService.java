package lv.degra.accounting.desktop.validation.service;

import java.util.List;

import lv.degra.accounting.desktop.document.controller.DocumentInfoController;
import lv.degra.accounting.core.validation.model.ValidationRule;

public interface ValidationService {
	List<ValidationRule> getValidationRulesByDocumentSybType(Integer documentSubtypeId);

	void applyRequiredValidation(ValidationRule validationRule, DocumentInfoController controller);

	void applyCustomValidation(ValidationRule validationRule, DocumentInfoController controller);
}
