package lv.degra.accounting.desktop.validation.service;

import java.util.List;

import lv.degra.accounting.core.validation.model.ValidationRule;
import lv.degra.accounting.desktop.document.controller.InfoController;

public interface ValidationService {
	List<ValidationRule> getValidationRulesByDocumentSybType(Integer documentSubtypeId);

	void applyRequiredValidation(ValidationRule validationRule, InfoController controller);

	void applyCustomValidation(ValidationRule validationRule, InfoController controller);

	void applyValidationRulesByDocumentSubType(InfoController infoController, int documentSubTypeId, Class<?> controllerClass);

	<T, C> T getFieldByName(C controller, String fieldName, Class<?> controllerClass);
}
