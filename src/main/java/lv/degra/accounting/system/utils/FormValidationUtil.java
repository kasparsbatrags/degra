package lv.degra.accounting.system.utils;

import javafx.scene.control.TextField;
import lv.degra.accounting.system.object.DatePickerWithErrorLabel;

public class FormValidationUtil {

	public static boolean isTextFieldNotEmpty(TextField textField) {
		String text = textField.getText().trim();
		return !text.isEmpty();
	}

	public static boolean isNumericTextField(TextField textField) {
		String text = textField.getText().trim();
		return text.matches("\\d+");
	}

	public static boolean isDatePickerWithErrorLabelFieldNotEmpty(DatePickerWithErrorLabel datePicker) {
		return null != datePicker.getValue();
	}

}
