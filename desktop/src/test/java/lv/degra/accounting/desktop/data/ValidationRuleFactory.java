package lv.degra.accounting.desktop.data;

import static lv.degra.accounting.desktop.data.DocumentSubTypeDataFactory.getGbsDocumentSubType;
import static lv.degra.accounting.desktop.data.ValidationRuleErrorMessageFactory.getPrecizionValidationRuleErrorMessage;
import static lv.degra.accounting.desktop.data.ValidationRuleErrorMessageFactory.getRequiredValidationRuleErrorMessage;
import static lv.degra.accounting.desktop.data.ValidationRuleObjectFactory.DIRECTION_COMBO_ID;
import static lv.degra.accounting.desktop.data.ValidationRuleObjectFactory.DIRECTION_COMBO_LABEL;
import static lv.degra.accounting.desktop.data.ValidationRuleObjectFactory.DIRECTION_COMBO_NAME;
import static lv.degra.accounting.desktop.data.ValidationRuleObjectFactory.DOCUMENT_DATE_DP_ID;
import static lv.degra.accounting.desktop.data.ValidationRuleObjectFactory.DOCUMENT_DATE_DP_LABEL;
import static lv.degra.accounting.desktop.data.ValidationRuleObjectFactory.DOCUMENT_DATE_DP_NAME;
import static lv.degra.accounting.desktop.data.ValidationRuleObjectFactory.DOCUMENT_SUB_TYPE_COMBO_ID;
import static lv.degra.accounting.desktop.data.ValidationRuleObjectFactory.DOCUMENT_SUB_TYPE_COMBO_LABEL;
import static lv.degra.accounting.desktop.data.ValidationRuleObjectFactory.DOCUMENT_SUB_TYPE_COMBO_NAME;
import static lv.degra.accounting.desktop.data.ValidationRuleObjectFactory.PUBLISHER_BANK_ACCOUNT_COMBO_ID;
import static lv.degra.accounting.desktop.data.ValidationRuleObjectFactory.PUBLISHER_BANK_ACCOUNT_COMBO_LABEL;
import static lv.degra.accounting.desktop.data.ValidationRuleObjectFactory.PUBLISHER_BANK_ACCOUNT_COMBO_NAME;
import static lv.degra.accounting.desktop.data.ValidationRuleObjectFactory.PUBLISHER_BANK_COMBO_ID;
import static lv.degra.accounting.desktop.data.ValidationRuleObjectFactory.PUBLISHER_BANK_COMBO_LABEL;
import static lv.degra.accounting.desktop.data.ValidationRuleObjectFactory.PUBLISHER_BANK_COMBO_NAME;
import static lv.degra.accounting.desktop.data.ValidationRuleObjectFactory.PUBLISHER_COMBO_ID;
import static lv.degra.accounting.desktop.data.ValidationRuleObjectFactory.PUBLISHER_COMBO_LABEL;
import static lv.degra.accounting.desktop.data.ValidationRuleObjectFactory.PUBLISHER_COMBO_NAME;
import static lv.degra.accounting.desktop.data.ValidationRuleObjectFactory.SUM_TOTAL_FIELD_ID;
import static lv.degra.accounting.desktop.data.ValidationRuleObjectFactory.SUM_TOTAL_FIELD_LABEL;
import static lv.degra.accounting.desktop.data.ValidationRuleObjectFactory.SUM_TOTAL_FIELD_NAME;
import static lv.degra.accounting.desktop.data.ValidationRuleObjectFactory.createValidationRuleObject;

import java.util.Arrays;
import java.util.List;

import lv.degra.accounting.core.validation.model.ValidationRule;

public class ValidationRuleFactory {


	public static List<ValidationRule> getGbsValidationRules() {
		return Arrays.asList(
				new ValidationRule(1, createValidationRuleObject(DOCUMENT_DATE_DP_ID, DOCUMENT_DATE_DP_NAME, DOCUMENT_DATE_DP_LABEL), true, true, true,
						null, getRequiredValidationRuleErrorMessage(), getGbsDocumentSubType()),
				new ValidationRule(2, createValidationRuleObject(DIRECTION_COMBO_ID, DIRECTION_COMBO_NAME, DIRECTION_COMBO_LABEL), true, true,true,
						null, getRequiredValidationRuleErrorMessage(), getGbsDocumentSubType()), new ValidationRule(3,
						createValidationRuleObject(DOCUMENT_SUB_TYPE_COMBO_ID, DOCUMENT_SUB_TYPE_COMBO_NAME, DOCUMENT_SUB_TYPE_COMBO_LABEL),true, true,
						true, null, getRequiredValidationRuleErrorMessage(), getGbsDocumentSubType()),
				new ValidationRule(4, createValidationRuleObject(SUM_TOTAL_FIELD_ID, SUM_TOTAL_FIELD_NAME, SUM_TOTAL_FIELD_LABEL), true, true,false,
						"{\"type\":\"decimal_precision\",\"min\":0,\"scale\":2}", getPrecizionValidationRuleErrorMessage(),
						getGbsDocumentSubType()),
				new ValidationRule(5, createValidationRuleObject(PUBLISHER_COMBO_ID, PUBLISHER_COMBO_NAME, PUBLISHER_COMBO_LABEL), true, true,true,
						null, getPrecizionValidationRuleErrorMessage(), getGbsDocumentSubType()), new ValidationRule(6,
						createValidationRuleObject(PUBLISHER_BANK_COMBO_ID, PUBLISHER_BANK_COMBO_NAME, PUBLISHER_BANK_COMBO_LABEL), false, false,true,
						null, getPrecizionValidationRuleErrorMessage(), getGbsDocumentSubType()), new ValidationRule(7,
						createValidationRuleObject(PUBLISHER_BANK_ACCOUNT_COMBO_ID, PUBLISHER_BANK_ACCOUNT_COMBO_NAME,
								PUBLISHER_BANK_ACCOUNT_COMBO_LABEL), false, false,true, null, getPrecizionValidationRuleErrorMessage(),
						getGbsDocumentSubType()));
	}
}
