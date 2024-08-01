package lv.degra.accounting.validation;

import lv.degra.accounting.validation.model.ValidationRule;

@FunctionalInterface
public interface ValidationFunction {
	void apply(ValidationRule validationRule);
}

