package lv.degra.accounting.desktop.validation.service;

import static org.apache.commons.lang3.StringUtils.EMPTY;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
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
import lv.degra.accounting.core.validation.model.ValidationRuleRepository;
import lv.degra.accounting.desktop.document.controller.DocumentControllerComponent;
import lv.degra.accounting.desktop.system.component.lazycombo.ControlWithErrorLabel;
import lv.degra.accounting.desktop.system.component.tableView.DynamicTableView;

@Slf4j
@Service
public class ValidationServiceImpl implements ValidationService {

	private final Map<String, BiConsumer<? extends DocumentControllerComponent, String>> validationActions = new HashMap<>();
	private final ValidationRuleRepository validationRuleRepository;

	@Autowired
	public ValidationServiceImpl(ValidationRuleRepository validationRuleRepository) {
		this.validationRuleRepository = validationRuleRepository;
	}

	public List<ValidationRule> getValidationRulesByDocumentSybType(Integer documentSubtypeId) {
		return validationRuleRepository.findByDocumentSubTypeId(documentSubtypeId);
	}

	public void applyValidationRulesByDocumentSubType(DocumentControllerComponent controller, int documentSubtypeId) {
		List<ValidationRule> validationRules = getValidationRulesByDocumentSybType(documentSubtypeId);
		cleanControlsValidationRoles(controller, validationRules.getFirst());

		for (ValidationRule rule : validationRules) {

			String validationObjectName = rule.getValidationObject().getName();
			Object control = getFieldByName(controller, validationObjectName);
			if (control != null) {
				String errorMessage =
						rule.getValidationRulesErrorMessage() != null ? rule.getValidationRulesErrorMessage().getShortMessage() : EMPTY;
				Predicate<?> predicate = null;

				if (rule.isRequired() && rule.getCustomValidation() == null) {
					predicate = Objects::nonNull;
				} else if (rule.getCustomValidation() != null) {
					if (control instanceof DynamicTableView) {
						predicate = createTableViewCustomPredicate(rule.getCustomValidation());
					} else {
						predicate = createSumTotalFieldCustomPredicate(rule.getCustomValidation());
					}
				}
				if (predicate != null) {
					addValidationControl(controller, validationObjectName, predicate, errorMessage);
				}
			}

		}
	}

	protected <T> void cleanControlsValidationRoles(DocumentControllerComponent controller, ValidationRule validationRule) {
		String validationObjectName = validationRule.getValidationObject().getName();

		if (isControlDynamicTableView(controller, validationObjectName)) {
			Object control = isControlDynamicTableView(controller, validationObjectName);
			DynamicTableView<T> tableView = (DynamicTableView<T>) control;
			tableView.clearValidationControls();
		} else {
			controller.clearValidationControls();
		}
	}

	public <T, C> T getFieldByName(C controller, String fieldName) {
		try {
			Field field = controller.getClass().getField(fieldName);
			field.setAccessible(true);
			return (T) field.get(controller);
		} catch (NoSuchFieldException e) {
			return null;
		} catch (IllegalAccessException e) {
			throw new RuntimeException("Cannot access field: " + fieldName, e);
		}
	}

	protected <T> void addValidationControl(DocumentControllerComponent controller, String fieldName, Predicate<T> predicate,
			String errorMessage) {
		Object control = getFieldByName(controller, fieldName);

		if (isControlDynamicTableView(controller, fieldName)) {
			DynamicTableView<T> tableView = (DynamicTableView<T>) control;
			tableView.addValidationControl((Predicate<DynamicTableView<?>>) predicate, errorMessage);
		} else {
			ControlWithErrorLabel<T> castedControl = (ControlWithErrorLabel<T>) control;
			controller.addValidationControl(castedControl, predicate, errorMessage);
		}
	}

	protected boolean isControlDynamicTableView(DocumentControllerComponent controller, String fieldName) {
		Object control = getFieldByName(controller, fieldName);
		return (control instanceof DynamicTableView);
	}

	public void applyRequiredValidation(ValidationRule validationRule, DocumentControllerComponent controller) {
		String validationObjectName = validationRule.getValidationObject().getName();
		String errorMessage = validationRule.getValidationRulesErrorMessage().getShortMessage();

		BiConsumer<DocumentControllerComponent, String> validationAction = (BiConsumer<DocumentControllerComponent, String>) validationActions.get(
				validationObjectName);
		if (validationAction != null) {
			validationAction.accept(controller, errorMessage);
		} else {
			throw new IllegalStateException("Unexpected validation. Object: " + validationObjectName);
		}
	}

	public void applyCustomValidation(ValidationRule validationRule, DocumentControllerComponent controller) {
		String errorMessage = validationRule.getValidationRulesErrorMessage().getShortMessage();
		if (validationRule.getValidationObject().getName().equals("sumTotalField")) {
			Predicate<String> predicate = createSumTotalFieldCustomPredicate(validationRule.getCustomValidation());
			controller.addValidationControl(controller.getSumTotalField(), predicate, errorMessage);
		}
		if (validationRule.getValidationObject().getName().equals("postingListView")) {
			Predicate<DynamicTableView<?>> predicate = createTableViewCustomPredicate(validationRule.getCustomValidation());
			controller.addTableViewValidationControl(controller.getPostingListView(), predicate, errorMessage);
		}
	}

	private Predicate<DynamicTableView<?>> createTableViewCustomPredicate(String validationValue) {
		try {
			ObjectMapper objectMapper = new ObjectMapper();
			JsonNode validationNode = objectMapper.readTree(validationValue);
			if ("tableViewPostTotalSum".equals(validationNode.get("type").asText())) {
				BigDecimal threshold = validationNode.has("threshold") ? validationNode.get("threshold").decimalValue() : BigDecimal.ZERO;

				return tableView -> {
					try {
						BigDecimal relatedObjectValue = null;
						JsonNode compareObject = validationNode.get("compareObject");
						if (compareObject != null) {

							String relatedObjectName;
							String fieldName;
							String fieldNameMethodName;
							String relatedObjectMethodName;

							relatedObjectName = compareObject.get("relatedObjectName").asText();
							relatedObjectMethodName =
									"get" + relatedObjectName.substring(0, 1).toUpperCase() + relatedObjectName.substring(1);
							fieldName = compareObject.get("fieldName").asText();
							fieldNameMethodName = "get" + fieldName.substring(0, 1).toUpperCase() + fieldName.substring(1);
							if (!tableView.getItems().isEmpty()) {
								Method relatedObjectMethod = tableView.getItems().getFirst().getClass().getMethod(relatedObjectMethodName);
								Object relatedObject = relatedObjectMethod.invoke(tableView.getItems().getFirst());
								if (relatedObject != null) {
									Method fieldNameMethod = relatedObject.getClass().getMethod(fieldNameMethodName);
									Object fieldObject = relatedObjectMethod.invoke(tableView.getItems().getFirst());
									if (fieldObject != null) {
										Object relatedObjectValueObject = fieldNameMethod.invoke(fieldObject);

										if (relatedObjectValueObject instanceof BigDecimal) {
											relatedObjectValue = BigDecimal.valueOf((Double) relatedObjectValueObject);
										} else if (relatedObjectValueObject instanceof Double) {
											relatedObjectValue = BigDecimal.valueOf((Double) relatedObjectValueObject);
										} else {
											throw new ClassCastException("Method did not return BigDecimal or Double");
										}
									}
								}
							}
						}

						BigDecimal totalAmount = tableView.getItems().stream().map(item -> {
							try {
								String columnName = validationNode.get("columnName").asText();
								String getterMethodName = "get" + columnName.substring(0, 1).toUpperCase() + columnName.substring(1);
								Method method = item.getClass().getMethod(getterMethodName);
								Object result = method.invoke(item);
								if (result instanceof BigDecimal) {
									return (BigDecimal) result;
								} else if (result instanceof Double) {
									return BigDecimal.valueOf((Double) result);
								} else {
									throw new ClassCastException("Method did not return BigDecimal or Double");
								}
							} catch (Exception e) {
								log.error("Error invoking method: {}", e.getMessage());
								return BigDecimal.ZERO;
							}
						}).filter(Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add);

						return (relatedObjectValue != null && totalAmount.compareTo(relatedObjectValue) == 0)
								|| (relatedObjectValue == null && totalAmount.compareTo(BigDecimal.ZERO) == 0);

					} catch (Exception e) {
						log.error("Error while calculating column sum: {}", e.getMessage());
						return false;
					}
				};
			}
		} catch (Exception e) {
			log.error("Error in createTableViewCustomPredicate: {}", e.getMessage(), e);
		}
		return value -> true;
	}

	protected Predicate<String> createSumTotalFieldCustomPredicate(String validationValue) {
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
