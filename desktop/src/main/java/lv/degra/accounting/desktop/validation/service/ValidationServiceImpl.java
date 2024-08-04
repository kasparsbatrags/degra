package lv.degra.accounting.desktop.validation.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Predicate;

import org.apache.logging.log4j.util.BiConsumer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lv.degra.accounting.desktop.document.controller.DocumentInfoController;
import lv.degra.accounting.core.validation.model.ValidationRule;
import lv.degra.accounting.core.validation.model.ValidationRulesRepository;

@Service
public class ValidationServiceImpl implements ValidationService {

	@Autowired
	private ValidationRulesRepository validationRulesRepository;

	@Autowired
	public ValidationServiceImpl(ValidationRulesRepository validationRulesRepository) {
		this.validationRulesRepository = validationRulesRepository;
	}

	public List<ValidationRule> getValidationRulesByDocumentSybType(Integer documentSubtypeId) {
		return validationRulesRepository.getByDocumentSubTypeId(documentSubtypeId);
	}

	private final Map<String, BiConsumer<DocumentInfoController, String>> validationActions = Map.of("documentDateDp",
			(controller, errorMessage) -> controller.addValidationControl(controller.getDocumentDateDp(), Objects::nonNull, errorMessage),
			"directionCombo",
			(controller, errorMessage) -> controller.addValidationControl(controller.getDirectionCombo(), Objects::nonNull, errorMessage),
			"documentSubTypeCombo",
			(controller, errorMessage) -> controller.addValidationControl(controller.getDocumentSubTypeCombo(), Objects::nonNull,
					errorMessage), "publisherCombo",
			(controller, errorMessage) -> controller.addValidationControl(controller.getPublisherCombo(), Objects::nonNull, errorMessage),
			"publisherBankCombo",
			(controller, errorMessage) -> controller.addValidationControl(controller.getPublisherBankCombo(), Objects::nonNull,
					errorMessage), "publisherBankAccountCombo",
			(controller, errorMessage) -> controller.addValidationControl(controller.getPublisherBankAccountCombo(), Objects::nonNull,
					errorMessage));


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
