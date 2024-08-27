package lv.degra.accounting.desktop.validation;

import lv.degra.accounting.core.validation.model.ValidationRule;

@FunctionalInterface
public interface ValidationFunction {
	void apply(ValidationRule validationRule);
}

