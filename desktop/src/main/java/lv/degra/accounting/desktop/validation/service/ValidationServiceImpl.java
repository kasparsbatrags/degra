package lv.degra.accounting.desktop.validation.service;

import static org.apache.commons.lang3.StringUtils.EMPTY;

import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Predicate;

import org.apache.logging.log4j.util.BiConsumer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lv.degra.accounting.core.validation.model.ValidationRule;
import lv.degra.accounting.core.validation.model.ValidationRulesRepository;
import lv.degra.accounting.desktop.document.controller.DocumentInfoController;
import lv.degra.accounting.desktop.system.object.ControlWithErrorLabel;

@Service
public class ValidationServiceImpl implements ValidationService {
	private final Map<String, BiConsumer<DocumentInfoController, String>> validationActions = new HashMap<>();
	@Autowired
	private final ValidationRulesRepository validationRulesRepository;

	@Autowired
	public ValidationServiceImpl(ValidationRulesRepository validationRulesRepository) {
		this.validationRulesRepository = validationRulesRepository;
	}

	public List<ValidationRule> getValidationRulesByDocumentSybType(Integer documentSubtypeId) {
		return validationRulesRepository.getByDocumentSubTypeId(documentSubtypeId);
	}

	public void applyValidationRulesByDocumentSubType(DocumentInfoController controller, int documentSubtypeId) {
		List<ValidationRule> validationRules = getValidationRulesByDocumentSybType(documentSubtypeId);

		for (ValidationRule rule : validationRules) {

			String validationObjectName = rule.getValidationObject().getName();
			String errorMessage;

			if (rule.isRequired()) {
				errorMessage =
						rule.getValidationRulesErrorMessage() != null ? rule.getValidationRulesErrorMessage().getShortMessage() : EMPTY;
				addValidationControl(controller, validationObjectName, Objects::nonNull, errorMessage);
			}
			if (rule.getCustomValidation() != null) {
				errorMessage =
						rule.getValidationRulesErrorMessage() != null ? rule.getValidationRulesErrorMessage().getShortMessage() : EMPTY;
				Predicate<String> predicate = createCustomPredicate(rule.getCustomValidation());
				addValidationControl(controller, validationObjectName, predicate, errorMessage);
			}

		}
	}

	public <T> T getFieldByName(DocumentInfoController controller, String fieldName) {
		try {
			Field field = DocumentInfoController.class.getDeclaredField(fieldName);
			field.setAccessible(true);
			return (T) field.get(controller);
		} catch (NoSuchFieldException | IllegalAccessException e) {
			throw new RuntimeException("Field not found: " + fieldName, e);
		}
	}


	private <T> void addValidationControl(DocumentInfoController controller, String fieldName, Predicate<T> predicate,
			String errorMessage) {
		ControlWithErrorLabel<T> control = getFieldByName(controller, fieldName);
		controller.addValidationControl(control, predicate, errorMessage);
	}


	public void applyRequiredValidation(ValidationRule validationRule, DocumentInfoController controller) {
		String validationObjectName = validationRule.getValidationObject().getName();
		String errorMessage = validationRule.getValidationRulesErrorMessage().getShortMessage();

		BiConsumer<DocumentInfoController, String> validationAction = validationActions.get(validationObjectName);
		if (validationAction != null) {
			validationAction.accept(controller, errorMessage);
		} else {
			throw new IllegalStateException("Unexpected validation. Object: " + validationObjectName);
		}
	}

	public void applyCustomValidation(ValidationRule validationRule, DocumentInfoController controller) {
		String errorMessage = validationRule.getValidationRulesErrorMessage().getShortMessage();
		if (validationRule.getValidationObject().getName().equals("sumTotalField")) {
			Predicate<String> predicate = createCustomPredicate(validationRule.getCustomValidation());
			controller.addValidationControl(controller.getSumTotalField(), predicate, errorMessage);
		}
	}

	protected Predicate<String> createCustomPredicate(String validationValue) {
		try {
			ObjectMapper objectMapper = new ObjectMapper();
			JsonNode validationNode = objectMapper.readTree(validationValue);
			if ("decimal_precision".equals(validationNode.get("type").asText())) {
				BigDecimal minValue = validationNode.has("min") ? validationNode.get("min").decimalValue() : BigDecimal.ZERO;
				int scale = validationNode.has("scale") ? validationNode.get("scale").intValue() : 2;
				return value -> {
					try {
						BigDecimal amount = new BigDecimal(value);
						return amount.compareTo(minValue) >= 0 && amount.scale() <= scale;
					} catch (NumberFormatException e) {
						return false;
					}
				};
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return value -> true; // Default predicate that always returns true
	}
}
