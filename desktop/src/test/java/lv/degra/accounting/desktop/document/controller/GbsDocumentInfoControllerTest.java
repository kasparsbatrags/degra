package lv.degra.accounting.desktop.document.controller;

import static lv.degra.accounting.desktop.data.BankDataFactory.CUSTOMER1_BANK1;
import static lv.degra.accounting.desktop.data.CustomerAccountDataFactory.CUSTOMER1_BANK1_ACCOUNT1;
import static lv.degra.accounting.desktop.data.CustomersData.getCustomer1;
import static lv.degra.accounting.desktop.data.DocumentDirectionDataFactory.INTERNAL_ID;
import static lv.degra.accounting.desktop.data.DocumentDirectionDataFactory.INTERNAL_NAME;
import static lv.degra.accounting.desktop.data.DocumentDirectionDataFactory.createDocumentDirection;
import static lv.degra.accounting.desktop.data.DocumentSubTypeDataFactory.getGbsDocumentSubType;
import static lv.degra.accounting.desktop.data.ValidationRuleErrorMessageFactory.getRequiredValidationRuleErrorMessage;
import static lv.degra.accounting.desktop.data.ValidationRuleFactory.getGbsValidationRules;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.lang.reflect.Field;
import java.time.LocalDate;
import java.util.Objects;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import javafx.application.Platform;
import javafx.embed.swing.JFXPanel;
import lv.degra.accounting.core.bank.model.Bank;
import lv.degra.accounting.core.customer.model.Customer;
import lv.degra.accounting.core.customer_account.model.CustomerAccount;
import lv.degra.accounting.core.document.model.DocumentDirection;
import lv.degra.accounting.core.document.model.DocumentSubType;
import lv.degra.accounting.desktop.system.object.ComboBoxWithErrorLabel;
import lv.degra.accounting.desktop.system.object.DatePickerWithErrorLabel;
import lv.degra.accounting.desktop.system.object.lazycombo.SearchableComboBox;
import lv.degra.accounting.core.validation.model.ValidationRule;
import lv.degra.accounting.core.validation.model.ValidationRuleErrorMessage;
import lv.degra.accounting.core.validation.model.ValidationRuleObject;
import lv.degra.accounting.desktop.validation.service.ValidationService;

class GbsDocumentInfoControllerTest {

	public ComboBoxWithErrorLabel<DocumentDirection> directionCombo;
	public DatePickerWithErrorLabel documentDateDp;
	public SearchableComboBox<Customer> publisherCombo;
	public ComboBoxWithErrorLabel<Bank> publisherBankCombo;
	public ComboBoxWithErrorLabel<CustomerAccount> publisherBankAccountCombo;

	@Mock
	private ValidationService validationService;

	@InjectMocks
	private DocumentInfoController documentInfoController;

	@InjectMocks
	private DocumentMainController documentMainController;

	private ComboBoxWithErrorLabel<DocumentSubType> documentSubTypeCombo;

	@BeforeEach
	void setUp() throws Exception {
		// Initialize JavaFX toolkit
		new JFXPanel();
		Platform.runLater(() -> {});

		// Open mocks after JavaFX initialization
		MockitoAnnotations.openMocks(this);

		// Initialize the ComboBox
		documentSubTypeCombo = new ComboBoxWithErrorLabel<>();
		directionCombo = new ComboBoxWithErrorLabel<>();
		documentDateDp = new DatePickerWithErrorLabel();
		publisherCombo = new SearchableComboBox<>();
		publisherBankCombo = new ComboBoxWithErrorLabel<>();
		publisherBankAccountCombo = new ComboBoxWithErrorLabel<>();

		// Set the private field 'documentSubTypeCombo' in DocumentInfoController
		setPrivateField(documentInfoController, "documentSubTypeCombo", documentSubTypeCombo);
		setPrivateField(documentInfoController, "directionCombo", directionCombo);
		setPrivateField(documentInfoController, "documentDateDp", documentDateDp);
		setPrivateField(documentInfoController, "publisherCombo", publisherCombo);
		setPrivateField(documentInfoController, "publisherBankCombo", publisherBankCombo);
		setPrivateField(documentInfoController, "publisherBankAccountCombo", publisherBankAccountCombo);

		// Initialize validation functions
		documentInfoController.validationFunctions.put("required",
				rule -> validationService.applyRequiredValidation(rule, documentInfoController));
		documentInfoController.validationFunctions.put("custom",
				rule -> validationService.applyCustomValidation(rule, documentInfoController));

		// Inject main controller
		setPrivateField(documentMainController, "documentInfoController", documentInfoController);
	}

	private void setPrivateField(Object target, String fieldName, Object value) throws Exception {
		Field field = target.getClass().getDeclaredField(fieldName);
		field.setAccessible(true);
		field.set(target, value);
	}

	@Test
	void testGbsDocumentRulesValidation() {

		DocumentSubType gbsDocumentSubType = getGbsDocumentSubType();
		documentSubTypeCombo.setValue(gbsDocumentSubType);
		directionCombo.setValue(createDocumentDirection(INTERNAL_ID, INTERNAL_NAME));
		documentDateDp.setValue(LocalDate.now());
		publisherCombo.setValue(getCustomer1());
		publisherBankCombo.setValue(CUSTOMER1_BANK1);
		publisherBankAccountCombo.setValue(CUSTOMER1_BANK1_ACCOUNT1);

		when(validationService.getValidationRulesByDocumentSybType(gbsDocumentSubType.getId())).thenReturn(getGbsValidationRules());

		documentInfoController.addValidationControl(documentSubTypeCombo, Objects::nonNull,
				getRequiredValidationRuleErrorMessage().getShortMessage());
		documentInfoController.addValidationControl(directionCombo, Objects::nonNull,
				getRequiredValidationRuleErrorMessage().getShortMessage());
		documentInfoController.addValidationControl(documentDateDp, Objects::nonNull,
				getRequiredValidationRuleErrorMessage().getShortMessage());
		documentInfoController.addValidationControl(publisherCombo, Objects::nonNull,
				getRequiredValidationRuleErrorMessage().getShortMessage());
		documentInfoController.addValidationControl(publisherBankCombo, Objects::nonNull,
				getRequiredValidationRuleErrorMessage().getShortMessage());
		documentInfoController.addValidationControl(publisherBankAccountCombo, Objects::nonNull,
				getRequiredValidationRuleErrorMessage().getShortMessage());

		documentInfoController.setDocumentInfoValidationRules();

		// Assert the validation
		Assertions.assertTrue(documentMainController.validateDocumentInfo());
	}

	@Test
	void testApplyRequiredValidation() {
		ValidationRule rule = new ValidationRule();
		ValidationRuleObject validationObject = new ValidationRuleObject();
		validationObject.setName("documentDateDp");
		rule.setValidationObject(validationObject);
		ValidationRuleErrorMessage errorMessage = new ValidationRuleErrorMessage();
		errorMessage.setShortMessage("Required field");
		rule.setValidationRulesErrorMessage(errorMessage);

		documentInfoController.applyRequiredValidation(rule);

		verify(validationService).applyRequiredValidation(rule, documentInfoController);
	}

	@Test
	void testApplyCustomValidation() {
		ValidationRule rule = new ValidationRule();
		ValidationRuleObject validationObject = new ValidationRuleObject();
		validationObject.setName("sumTotalField");
		rule.setValidationObject(validationObject);
		ValidationRuleErrorMessage errorMessage = new ValidationRuleErrorMessage();
		errorMessage.setShortMessage("Invalid value");
		rule.setValidationRulesErrorMessage(errorMessage);
		rule.setCustomValidation("{\"type\":\"decimal_precision\",\"min\":0,\"scale\":2}");

		documentInfoController.applyCustomValidation(rule);

		verify(validationService).applyCustomValidation(rule, documentInfoController);
	}
}
