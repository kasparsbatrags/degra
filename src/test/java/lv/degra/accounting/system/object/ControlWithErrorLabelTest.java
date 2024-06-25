package lv.degra.accounting.system.object;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.math.BigDecimal;
import java.util.function.Predicate;

import org.junit.jupiter.api.Test;

import javafx.embed.swing.JFXPanel;

class ControlWithErrorLabelTest {

	static {
		new JFXPanel();
	}

	@Test
	void testTextFieldWithErrorLabelValidation() {
		TextFieldWithErrorLabel textFieldWithErrorLabel = new TextFieldWithErrorLabel();
		Predicate<String> documentAmountValidation = value -> {
			try {
				BigDecimal amount = new BigDecimal(value);
				return amount.compareTo(BigDecimal.ZERO) > 0 && amount.scale() <= 2;
			} catch (NumberFormatException e) {
				return false;
			}
		};

		textFieldWithErrorLabel.setValidationCondition(documentAmountValidation);

		textFieldWithErrorLabel.setText("123.45");
		textFieldWithErrorLabel.validate();
		assertTrue(textFieldWithErrorLabel.isValid());

		textFieldWithErrorLabel.setText("123.456");
		textFieldWithErrorLabel.validate();
		assertFalse(textFieldWithErrorLabel.isValid());

		textFieldWithErrorLabel.setText("-123.456");
		textFieldWithErrorLabel.validate();
		assertFalse(textFieldWithErrorLabel.isValid());

	}

	@Test
	void testComboBoxWithErrorLabelValidation() {
		ComboBoxWithErrorLabel<String> comboBoxWithErrorLabel = new ComboBoxWithErrorLabel<>();
		Predicate<String> selectionValidation = value -> value != null && !value.isEmpty();

		comboBoxWithErrorLabel.setValidationCondition(selectionValidation);

		comboBoxWithErrorLabel.setValue("Option 1");
		comboBoxWithErrorLabel.validate();
		assertTrue(comboBoxWithErrorLabel.isValid());

		comboBoxWithErrorLabel.setValue(null);
		comboBoxWithErrorLabel.validate();
		assertFalse(comboBoxWithErrorLabel.isValid());
	}
}
