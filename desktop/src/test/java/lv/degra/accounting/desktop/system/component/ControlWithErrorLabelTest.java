package lv.degra.accounting.desktop.system.component;

import static lv.degra.accounting.desktop.system.configuration.DegraDesktopConfig.FIELD_REQUIRED_MESSAGE;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.math.BigDecimal;
import java.util.function.Predicate;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.testfx.api.FxToolkit;

import javafx.embed.swing.JFXPanel;

class ControlWithErrorLabelTest {

	static {
		// Initializes JavaFX runtime to avoid "Toolkit not initialized" exception
		new JFXPanel();
	}

	@BeforeEach
	public void setUpClass() throws Exception {
		FxToolkit.registerPrimaryStage();
	}

	@AfterEach
	public void tearDown() throws Exception {
		FxToolkit.cleanupStages();
	}


	@Test
	void testTextFieldWithErrorLabelValidation() {
		TextFieldWithErrorLabel textFieldWithErrorLabel = new TextFieldWithErrorLabel();

		Predicate<String> validAmount = value -> {
			try {
				BigDecimal amount = new BigDecimal(value);
				return amount.compareTo(BigDecimal.ZERO) > 0;
			} catch (NumberFormatException e) {
				return false;
			}
		};

		Predicate<String> validScale = value -> {
			try {
				BigDecimal amount = new BigDecimal(value);
				return amount.scale() <= 2;
			} catch (NumberFormatException e) {
				return false;
			}
		};

		textFieldWithErrorLabel.setValidationCondition(validAmount, "Amount must be greater than zero.");
		textFieldWithErrorLabel.setValidationCondition(validScale, "Amount must have at most 2 decimal places.");

		// Test with valid input
		textFieldWithErrorLabel.setText("123.45");
		textFieldWithErrorLabel.validate();
		assertTrue(textFieldWithErrorLabel.isValid());
		assertEquals("", textFieldWithErrorLabel.getErrorText());

		// Test with invalid input (more than 2 decimal places)
		textFieldWithErrorLabel.setText("123.456");
		textFieldWithErrorLabel.validate();
		assertFalse(textFieldWithErrorLabel.isValid());
		assertEquals("Amount must have at most 2 decimal places.", textFieldWithErrorLabel.getErrorText());

		// Test with invalid input (negative amount)
		textFieldWithErrorLabel.setText("-123.45");
		textFieldWithErrorLabel.validate();
		assertFalse(textFieldWithErrorLabel.isValid());
		assertEquals("Amount must be greater than zero.", textFieldWithErrorLabel.getErrorText());

		// Test with required field empty
		textFieldWithErrorLabel.setRequired(true);
		textFieldWithErrorLabel.setText("");
		textFieldWithErrorLabel.validate();
		assertFalse(textFieldWithErrorLabel.isValid());
		assertEquals(FIELD_REQUIRED_MESSAGE, textFieldWithErrorLabel.getErrorText());
	}

	@Test
	void testComboBoxWithErrorLabelValidation() {
		ComboBoxWithErrorLabel<String> comboBoxWithErrorLabel = new ComboBoxWithErrorLabel<>();
		Predicate<String> selectionValidation = value -> value != null && !value.isEmpty();

		comboBoxWithErrorLabel.setValidationCondition(selectionValidation, "Selection cannot be empty.");

		// Test with valid input
		comboBoxWithErrorLabel.setValue("Option 1");
		comboBoxWithErrorLabel.validate();
		assertTrue(comboBoxWithErrorLabel.isValid());
		assertEquals("", comboBoxWithErrorLabel.getErrorText());

		// Test with invalid input
		comboBoxWithErrorLabel.setValue(null);
		comboBoxWithErrorLabel.validate();
		assertFalse(comboBoxWithErrorLabel.isValid());
		assertEquals("Selection cannot be empty.", comboBoxWithErrorLabel.getErrorText());
	}
}
