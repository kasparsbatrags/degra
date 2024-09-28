package lv.degra.accounting.desktop.validation.service;

import java.util.List;

import lv.degra.accounting.core.validation.model.ValidationRule;
import lv.degra.accounting.desktop.document.controller.DocumentInfoController;

public interface ValidationService {
	List<ValidationRule> getValidationRulesByDocumentSybType(Integer documentSubtypeId);

	void applyRequiredValidation(ValidationRule validationRule, DocumentInfoController controller);

	void applyCustomValidation(ValidationRule validationRule, DocumentInfoController controller);

	void applyValidationRulesByDocumentSubType(DocumentInfoController documentInfoController, int documentSubTypeId, Class<?> controllerClass);

	<T, C> T getFieldByName(C controller, String fieldName, Class<?> controllerClass);
}
