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

import lombok.extern.slf4j.Slf4j;
import lv.degra.accounting.core.validation.model.ValidationRule;
import lv.degra.accounting.core.validation.model.ValidationRulesRepository;
import lv.degra.accounting.desktop.document.controller.InfoController;
import lv.degra.accounting.desktop.system.component.ControlWithErrorLabel;

@Slf4j
@Service
public class ValidationServiceImpl implements ValidationService {

	private final Map<String, BiConsumer<InfoController, String>> validationActions = new HashMap<>();
	private final ValidationRulesRepository validationRulesRepository;

	@Autowired
	public ValidationServiceImpl(ValidationRulesRepository validationRulesRepository) {
		this.validationRulesRepository = validationRulesRepository;
	}

	public List<ValidationRule> getValidationRulesByDocumentSybType(Integer documentSubtypeId) {
		return validationRulesRepository.findByDocumentSubTypeId(documentSubtypeId);
	}

	public void applyValidationRulesByDocumentSubType(InfoController controller, int documentSubtypeId, Class<?> controllerClass) {
		controller.getMediator().clearValidationControls();
		List<ValidationRule> validationRules = getValidationRulesByDocumentSybType(documentSubtypeId);

		for (ValidationRule rule : validationRules) {

			String validationObjectName = rule.getValidationObject().getName();
			String errorMessage;

			if (rule.isRequired()) {
				errorMessage =
						rule.getValidationRulesErrorMessage() != null ? rule.getValidationRulesErrorMessage().getShortMessage() : EMPTY;
				addValidationControl(controller, validationObjectName, Objects::nonNull, errorMessage, controllerClass);
			}
			if (rule.getCustomValidation() != null) {
				errorMessage =
						rule.getValidationRulesErrorMessage() != null ? rule.getValidationRulesErrorMessage().getShortMessage() : EMPTY;
				Predicate<String> predicate = createCustomPredicate(rule.getCustomValidation());
				addValidationControl(controller, validationObjectName, predicate, errorMessage, controllerClass);
			}

		}
	}

	public <T, C> T getFieldByName(C controller, String fieldName, Class<?> controllerClass) {
		try {
			Field field = controllerClass.getDeclaredField(fieldName);
			field.setAccessible(true);
			return (T) field.get(controller);
		} catch (NoSuchFieldException e) {
			Class<?> superClass = controllerClass.getSuperclass();
			if (superClass != null) {
				return getFieldByName(controller, fieldName, superClass);
			} else {
				return null;
			}
		} catch (IllegalAccessException e) {
			throw new RuntimeException("Cannot access field: " + fieldName, e);
		}
	}

	private <T> void addValidationControl(InfoController controller, String fieldName, Predicate<T> predicate,
			String errorMessage, Class<?> controllerClass) {
		ControlWithErrorLabel<T> control = getFieldByName(controller, fieldName, controllerClass);
		if (control != null) {
			controller.getMediator().addValidationControl(control, predicate, errorMessage);
		}
	}

	public void applyRequiredValidation(ValidationRule validationRule, InfoController controller) {
		String validationObjectName = validationRule.getValidationObject().getName();
		String errorMessage = validationRule.getValidationRulesErrorMessage().getShortMessage();

		BiConsumer<InfoController, String> validationAction = validationActions.get(validationObjectName);
		if (validationAction != null) {
			validationAction.accept(controller, errorMessage);
		} else {
			throw new IllegalStateException("Unexpected validation. Object: " + validationObjectName);
		}
	}

	public void applyCustomValidation(ValidationRule validationRule, InfoController controller) {
		String errorMessage = validationRule.getValidationRulesErrorMessage().getShortMessage();
		if (validationRule.getValidationObject().getName().equals("sumTotalField")) {
			Predicate<String> predicate = createCustomPredicate(validationRule.getCustomValidation());
			controller.getMediator().addValidationControl(controller.getSumTotalField(), predicate, errorMessage);
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
			log.error(e.getMessage(), e.getCause());
		}
		return value -> true;
	}
}
