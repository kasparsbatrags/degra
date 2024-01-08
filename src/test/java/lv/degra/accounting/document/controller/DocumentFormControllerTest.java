package lv.degra.accounting.document.documentFormController;

import static lv.degra.accounting.configuration.DegraConfig.SUM_FORMAT_REGEX;
import static lv.degra.accounting.document.DocumentFieldsUtils.getDouble;
import static lv.degra.accounting.document.DocumentFieldsUtils.setFieldFormat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.regex.Pattern;

import org.junit.jupiter.api.Test;
import org.testfx.framework.junit5.ApplicationTest;

import javafx.embed.swing.JFXPanel;
import javafx.scene.control.TextField;
import javafx.scene.control.TextFormatter;
import javafx.stage.Stage;
import lv.degra.accounting.document.controller.BillController;
import lv.degra.accounting.system.exception.IncorrectSumException;

class DocumentFormdocumentFormControllerTest extends ApplicationTest {

	private static final String CORRECT_SUM_INPUT = "123.45";
	private static final String INCORRECT_CORRECT_SUM_INPUT = "abc";
	private BillController billController;


	@Override
	public void start(Stage stage) {
		// Initialize JavaFX environment for testing
		new JFXPanel();
		billController.billRowPricePerUnitField = new TextField();
		billController.billRowQuantityField = new TextField();
		billController.billRowVatPercentField = new TextField();
	}

	@Test
	void setFieldFormat_shouldApplyTextFormatter() {

		TextField textField = new TextField();
		setFieldFormat(textField, SUM_FORMAT_REGEX);

		TextFormatter<?> textFormatter = textField.getTextFormatter();
		assertNotNull(textFormatter);

		interact(() -> {
			textField.setText(CORRECT_SUM_INPUT);
		});
		assertEquals(CORRECT_SUM_INPUT, textField.getText(), "Valid input should be accepted");
		textField.setText("");
		interact(() -> {
			textField.setText(INCORRECT_CORRECT_SUM_INPUT);
		});
		assertEquals("", textField.getText(), "Invalid input should be rejected");

		// Test regex pattern
		Pattern pattern = Pattern.compile(SUM_FORMAT_REGEX);
		assertTrue(pattern.matcher(CORRECT_SUM_INPUT).matches(), "Valid input should match the pattern");
		assertFalse(pattern.matcher(INCORRECT_CORRECT_SUM_INPUT).matches(), "Invalid input should not match the pattern");
	}

	@Test
	void testGetSumPerAll() {
		billController.billRowPricePerUnitField.setText("10");
		billController.billRowQuantityField.setText("5");

		assertEquals(50.0, billController.getSumPerAll());
	}

	@Test
	void testGetVatSum() {
		billController.billRowPricePerUnitField.setText("10");
		billController.billRowQuantityField.setText("10");
		billController.billRowVatPercentField.setText("21");

		assertEquals(21.0, billController.getVatSum());
	}

	@Test
	void testGetRowSumTotal() {
		billController.billRowPricePerUnitField.setText("10");
		billController.billRowQuantityField.setText("5");
		billController.billRowVatPercentField.setText("20");

		assertEquals(60.0, billController.getRowSumTotal());
	}

	@Test
	void testGetDouble() {
		assertEquals(15.5, getDouble("15.5"));
	}

	@Test
	void testGetDoubleWithInvalidInput() {
		assertThrows(IncorrectSumException.class, () -> getDouble("invalidInput"));
	}
}