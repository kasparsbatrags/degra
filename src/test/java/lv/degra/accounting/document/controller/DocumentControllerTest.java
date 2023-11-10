package lv.degra.accounting.document.controller;

import static lv.degra.accounting.configuration.DegraConfig.SUM_FORMAT_REGEX;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.regex.Pattern;

import org.junit.jupiter.api.Test;
import org.testfx.framework.junit5.ApplicationTest;

import javafx.embed.swing.JFXPanel;
import javafx.scene.control.TextField;
import javafx.scene.control.TextFormatter;
import javafx.stage.Stage;

class DocumentControllerTest extends ApplicationTest {

	private static final String CORRECT_SUM_INPUT = "123.45";
	private static final String INCORRECT_CORRECT_SUM_INPUT = "abc";
	private DocumentController documentController;

	@Override
	public void start(Stage stage) {
		// Initialize JavaFX environment for testing
		new JFXPanel();
		documentController = new DocumentController();
	}

	@Test
	void setFieldFormat_shouldApplyTextFormatter() {

		TextField textField = new TextField();
		documentController.setFieldFormat(textField, SUM_FORMAT_REGEX);

		TextFormatter<?> textFormatter = textField.getTextFormatter();
		assertNotNull(textFormatter);

		String validInput = CORRECT_SUM_INPUT;
		interact(() -> {
			textField.setText(validInput);
		});
		assertEquals(validInput, textField.getText(), "Valid input should be accepted");
		textField.setText("");
		String invalidInput = INCORRECT_CORRECT_SUM_INPUT;
		interact(() -> {
			textField.setText(invalidInput);
		});
		assertEquals("", textField.getText(), "Invalid input should be rejected");

		// Test regex pattern
		Pattern pattern = Pattern.compile(SUM_FORMAT_REGEX);
		assertTrue(pattern.matcher(CORRECT_SUM_INPUT).matches(), "Valid input should match the pattern");
		assertFalse(pattern.matcher(INCORRECT_CORRECT_SUM_INPUT).matches(), "Invalid input should not match the pattern");
	}
}