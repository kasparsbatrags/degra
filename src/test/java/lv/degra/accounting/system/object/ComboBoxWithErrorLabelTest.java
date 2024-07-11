package lv.degra.accounting.system.object;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.testfx.api.FxToolkit;
import org.testfx.framework.junit5.ApplicationTest;

import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.event.ActionEvent;

class ComboBoxWithErrorLabelTest extends ApplicationTest {

	private ComboBoxWithErrorLabel<String> comboBoxWithErrorLabel;

	@BeforeEach
	public void setUp() {
		comboBoxWithErrorLabel = new ComboBoxWithErrorLabel<>();
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
	void testSetItems() {
		ObservableList<String> items = FXCollections.observableArrayList("Option 1", "Option 2", "Option 3");
		comboBoxWithErrorLabel.setItems(items);
		assertEquals(items, comboBoxWithErrorLabel.getComboBox().getItems());
	}

	@Test
	void testSetValue() {
		String value = "Option 1";
		comboBoxWithErrorLabel.setValue(value);
		assertEquals(value, comboBoxWithErrorLabel.getValue());
	}

	@Test
	void testOnAction() {
		final boolean[] actionTriggered = { false };
		comboBoxWithErrorLabel.setOnAction(event -> actionTriggered[0] = true);
		interact(() -> comboBoxWithErrorLabel.getComboBox().fireEvent(new ActionEvent()));
		assertTrue(actionTriggered[0]);
	}

	@Test
	void testValidate() {
		comboBoxWithErrorLabel.setValidationCondition(value -> value != null && !value.isEmpty(), "Field is required");
		comboBoxWithErrorLabel.validate();
		assertFalse(comboBoxWithErrorLabel.isValid());

		comboBoxWithErrorLabel.setValue("Valid value");
		comboBoxWithErrorLabel.validate();
		assertTrue(comboBoxWithErrorLabel.isValid());
	}
}
