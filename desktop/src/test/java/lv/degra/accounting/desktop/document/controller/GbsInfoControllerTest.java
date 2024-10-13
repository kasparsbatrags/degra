//package lv.degra.accounting.desktop.document.controller;
//
//import static lv.degra.accounting.desktop.data.BankDataFactory.ACUSTOMER_SWED_BANK;
//import static lv.degra.accounting.desktop.data.CustomerAccountDataFactory.CUSTOMER1_BANK1_ACCOUNT1;
//import static lv.degra.accounting.desktop.data.CustomersData.getCustomer1;
//import static lv.degra.accounting.desktop.data.DocumentDirectionDataFactory.INTERNAL_ID;
//import static lv.degra.accounting.desktop.data.DocumentDirectionDataFactory.INTERNAL_NAME;
//import static lv.degra.accounting.desktop.data.DocumentDirectionDataFactory.createDocumentDirection;
//import static lv.degra.accounting.desktop.data.DocumentSubTypeDataFactory.getGbsDocumentSubType;
//import static lv.degra.accounting.desktop.data.ValidationRuleErrorMessageFactory.getRequiredValidationRuleErrorMessage;
//import static lv.degra.accounting.desktop.data.ValidationRuleFactory.getGbsValidationRules;
//import static org.mockito.Mockito.verify;
//import static org.mockito.Mockito.when;
//
//import java.lang.reflect.Field;
//import java.time.LocalDate;
//import java.util.Objects;
//
//import org.junit.jupiter.api.Assertions;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.MockitoAnnotations;
//
//import javafx.application.Platform;
//import javafx.embed.swing.JFXPanel;
//import lv.degra.accounting.core.bank.model.Bank;
//import lv.degra.accounting.core.customer.model.Customer;
//import lv.degra.accounting.core.customer_account.model.CustomerAccount;
//import lv.degra.accounting.core.document.model.DocumentDirection;
//import lv.degra.accounting.core.document.model.DocumentSubType;
//import lv.degra.accounting.core.validation.model.ValidationRule;
//import lv.degra.accounting.core.validation.model.ValidationRuleErrorMessage;
//import lv.degra.accounting.core.validation.model.ValidationRuleObject;
//import lv.degra.accounting.desktop.system.component.lazycombo.ComboBoxWithErrorLabel;
//import lv.degra.accounting.desktop.system.component.DatePickerWithErrorLabel;
//import lv.degra.accounting.desktop.system.component.lazycombo.SearchableComboBox;
//import lv.degra.accounting.desktop.validation.service.ValidationService;
//
//class GbsInfoControllerTest {
//
//	public ComboBoxWithErrorLabel<DocumentDirection> directionCombo;
//	public DatePickerWithErrorLabel documentDateDp;
//	public SearchableComboBox<Customer> publisherCombo;
//	public ComboBoxWithErrorLabel<Bank> publisherBankCombo;
//	public ComboBoxWithErrorLabel<CustomerAccount> publisherBankAccountCombo;
//
//	@Mock
//	private ValidationService validationService;
//
//	@InjectMocks
//	private InfoController infoController;
//
//	@InjectMocks
//	private MainController mainController;
//
//	private ComboBoxWithErrorLabel<DocumentSubType> documentSubTypeCombo;
//
//	@BeforeEach
//	void setUp() throws Exception {
//		// Initialize JavaFX toolkit
//		new JFXPanel();
//		Platform.runLater(() -> {});
//
//		// Open mocks after JavaFX initialization
//		MockitoAnnotations.openMocks(this);
//
//		// Initialize the ComboBox
//		documentSubTypeCombo = new ComboBoxWithErrorLabel<>();
//		directionCombo = new ComboBoxWithErrorLabel<>();
//		documentDateDp = new DatePickerWithErrorLabel();
//		publisherCombo = new SearchableComboBox<>();
//		publisherBankCombo = new ComboBoxWithErrorLabel<>();
//		publisherBankAccountCombo = new ComboBoxWithErrorLabel<>();
//
//		// Set the private field 'documentSubTypeCombo' in DocumentInfoController
//		setPrivateField(infoController, "documentSubTypeCombo", documentSubTypeCombo);
//		setPrivateField(infoController, "directionCombo", directionCombo);
//		setPrivateField(infoController, "documentDateDp", documentDateDp);
//		setPrivateField(infoController, "publisherCombo", publisherCombo);
//		setPrivateField(infoController, "publisherBankCombo", publisherBankCombo);
//		setPrivateField(infoController, "publisherBankAccountCombo", publisherBankAccountCombo);
//
//		// Initialize validation functions
//		infoController.validationFunctions.put("required",
//				rule -> validationService.applyRequiredValidation(rule, infoController));
//		infoController.validationFunctions.put("custom",
//				rule -> validationService.applyCustomValidation(rule, infoController));
//
//		// Inject main controller
//		setPrivateField(mainController, "documentInfoController", infoController);
//	}
//
//	private void setPrivateField(Object target, String fieldName, Object value) throws Exception {
//		Field field = target.getClass().getDeclaredField(fieldName);
//		field.setAccessible(true);
//		field.set(target, value);
//	}
//
//	@Test
//	void testGbsDocumentRulesValidation() {
//
//		DocumentSubType gbsDocumentSubType = getGbsDocumentSubType();
//		documentSubTypeCombo.setValue(gbsDocumentSubType);
//		directionCombo.setValue(createDocumentDirection(INTERNAL_ID, INTERNAL_NAME));
//		documentDateDp.setValue(LocalDate.now());
//		publisherCombo.setValue(getCustomer1());
//		publisherBankCombo.setValue(ACUSTOMER_SWED_BANK);
//		publisherBankAccountCombo.setValue(CUSTOMER1_BANK1_ACCOUNT1);
//
//		when(validationService.getValidationRulesByDocumentSybType(gbsDocumentSubType.getId())).thenReturn(getGbsValidationRules());
//
//		infoController.getMediator().addValidationControl(documentSubTypeCombo, Objects::nonNull,
//				getRequiredValidationRuleErrorMessage().getShortMessage());
//		infoController.getMediator().addValidationControl(directionCombo, Objects::nonNull,
//				getRequiredValidationRuleErrorMessage().getShortMessage());
//		infoController.getMediator().addValidationControl(documentDateDp, Objects::nonNull,
//				getRequiredValidationRuleErrorMessage().getShortMessage());
//		infoController.getMediator().addValidationControl(publisherCombo, Objects::nonNull,
//				getRequiredValidationRuleErrorMessage().getShortMessage());
//		infoController.getMediator().addValidationControl(publisherBankCombo, Objects::nonNull,
//				getRequiredValidationRuleErrorMessage().getShortMessage());
//		infoController.getMediator().addValidationControl(publisherBankAccountCombo, Objects::nonNull,
//				getRequiredValidationRuleErrorMessage().getShortMessage());
//
//		infoController.setDocumentInfoValidationRules();
//
//		// Assert the validation
//		Assertions.assertTrue(mainController.validateDocumentInfo());
//	}
//
//	@Test
//	void testApplyRequiredValidation() {
//		ValidationRule rule = new ValidationRule();
//		ValidationRuleObject validationObject = new ValidationRuleObject();
//		validationObject.setName("documentDateDp");
//		rule.setValidationObject(validationObject);
//		ValidationRuleErrorMessage errorMessage = new ValidationRuleErrorMessage();
//		errorMessage.setShortMessage("Required field");
//		rule.setValidationRulesErrorMessage(errorMessage);
//
//		infoController.applyRequiredValidation(rule);
//
//		verify(validationService).applyRequiredValidation(rule, infoController);
//	}
//
//	@Test
//	void testApplyCustomValidation() {
//		ValidationRule rule = new ValidationRule();
//		ValidationRuleObject validationObject = new ValidationRuleObject();
//		validationObject.setName("sumTotalField");
//		rule.setValidationObject(validationObject);
//		ValidationRuleErrorMessage errorMessage = new ValidationRuleErrorMessage();
//		errorMessage.setShortMessage("Invalid value");
//		rule.setValidationRulesErrorMessage(errorMessage);
//		rule.setCustomValidation("{\"type\":\"decimal_precision\",\"min\":0,\"scale\":2}");
//
//		infoController.applyCustomValidation(rule);
//
//		verify(validationService).applyCustomValidation(rule, infoController);
//	}
//}
