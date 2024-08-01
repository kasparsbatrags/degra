package lv.degra.accounting.data;



import java.util.Arrays;
import java.util.List;

import lv.degra.accounting.validation.model.ValidationRuleObject;

public class ValidationRuleObjectFactory {

	public static final int DOCUMENT_DATE_DP_ID = 1;
	public static final String DOCUMENT_DATE_DP_NAME = "documentDateDp";
	public static final String DOCUMENT_DATE_DP_LABEL = "Dokumenta datums";

	public static final int DIRECTION_COMBO_ID = 2;
	public static final String DIRECTION_COMBO_NAME = "directionCombo";
	public static final String DIRECTION_COMBO_LABEL = "Dokumenta virziens";

	public static final int DOCUMENT_SUB_TYPE_COMBO_ID = 3;
	public static final String DOCUMENT_SUB_TYPE_COMBO_NAME = "documentSubTypeCombo";
	public static final String DOCUMENT_SUB_TYPE_COMBO_LABEL = "Dokumenta apakštips";

	public static final int SUM_TOTAL_FIELD_ID = 4;
	public static final String SUM_TOTAL_FIELD_NAME = "sumTotalField";
	public static final String SUM_TOTAL_FIELD_LABEL = "Dokumenta summa";

	public static final int PUBLISHER_COMBO_ID = 5;
	public static final String PUBLISHER_COMBO_NAME = "publisherCombo";
	public static final String PUBLISHER_COMBO_LABEL = "Dokumenta izdevējs";

	public static final int PUBLISHER_BANK_COMBO_ID = 6;
	public static final String PUBLISHER_BANK_COMBO_NAME = "publisherBankCombo";
	public static final String PUBLISHER_BANK_COMBO_LABEL = "Dokumenta izdevēja norēķinu baka";

	public static final int PUBLISHER_BANK_ACCOUNT_COMBO_ID = 7;
	public static final String PUBLISHER_BANK_ACCOUNT_COMBO_NAME = "publisherBankAccountCombo";
	public static final String PUBLISHER_BANK_ACCOUNT_COMBO_LABEL = "Dokumenta izdevēja norēķinu konts";

	public static List<ValidationRuleObject> getGbsValidationRuleObjects() {
		return Arrays.asList(
				createValidationRuleObject(DOCUMENT_DATE_DP_ID, DOCUMENT_DATE_DP_NAME, DOCUMENT_DATE_DP_LABEL),
				createValidationRuleObject(DIRECTION_COMBO_ID, DIRECTION_COMBO_NAME, DIRECTION_COMBO_LABEL),
				createValidationRuleObject(DOCUMENT_SUB_TYPE_COMBO_ID, DOCUMENT_SUB_TYPE_COMBO_NAME, DOCUMENT_SUB_TYPE_COMBO_LABEL),
				createValidationRuleObject(SUM_TOTAL_FIELD_ID, SUM_TOTAL_FIELD_NAME, SUM_TOTAL_FIELD_LABEL),
				createValidationRuleObject(PUBLISHER_COMBO_ID, PUBLISHER_COMBO_NAME, PUBLISHER_COMBO_LABEL),
				createValidationRuleObject(PUBLISHER_BANK_COMBO_ID, PUBLISHER_BANK_COMBO_NAME, PUBLISHER_BANK_COMBO_LABEL),
				createValidationRuleObject(PUBLISHER_BANK_ACCOUNT_COMBO_ID, PUBLISHER_BANK_ACCOUNT_COMBO_NAME, PUBLISHER_BANK_ACCOUNT_COMBO_LABEL)
		);
	}

	public static ValidationRuleObject createValidationRuleObject(int id, String name, String label) {
		return new ValidationRuleObject(id, name, label);
	}
}
