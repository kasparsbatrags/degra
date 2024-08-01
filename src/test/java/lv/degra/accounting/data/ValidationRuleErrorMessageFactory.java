package lv.degra.accounting.data;

import java.util.Arrays;
import java.util.List;

import lv.degra.accounting.validation.model.ValidationRuleErrorMessage;

public class ValidationRuleErrorMessageFactory {

	public static List<ValidationRuleErrorMessage> createValidationRuleErrorMessages() {
		return Arrays.asList(getRequiredValidationRuleErrorMessage(), getPrecizionValidationRuleErrorMessage());
	}

	public static ValidationRuleErrorMessage getRequiredValidationRuleErrorMessage() {
		return new ValidationRuleErrorMessage(1, "Obligāti jāaizpilda!",
				"Laukā obligādi jāaizpilda prasītā informācija - citādi netiks turpināts");
	}

	public static ValidationRuleErrorMessage getPrecizionValidationRuleErrorMessage() {
		return new ValidationRuleErrorMessage(2, "Pārāk daudz ciparu aiz komata!",
				"Jāprecizē skaitlis  - ar noteikto skaitu ciparu aiz komata - citādi netiks turpināts");
	}

}
