package lv.degra.accounting.system.object;

import java.util.function.Predicate;

import javafx.beans.property.BooleanProperty;
import javafx.beans.property.SimpleBooleanProperty;
import javafx.scene.control.Control;
import javafx.scene.control.Label;
import javafx.scene.layout.VBox;

public abstract class ControlWithErrorLabel<T> extends VBox {
	protected Label errorLabel;
	protected BooleanProperty valid;
	protected Predicate<T> validationCondition;
	protected BooleanProperty dataSaved;
	protected Predicate<Void> combinedValidationCondition;

	protected ControlWithErrorLabel() {
		errorLabel = new Label();
		valid = new SimpleBooleanProperty(true);
		errorLabel.setStyle("-fx-text-fill: red;");
		dataSaved = new SimpleBooleanProperty(true);
		this.getChildren().add(errorLabel);
		errorLabel.setVisible(false);
	}

	public void setErrorText(String errorText) {
		errorLabel.setText(errorText);
		errorLabel.setVisible(!errorText.isEmpty());
	}

	public void setValid(boolean isValid) {
		this.valid.set(isValid);
	}

	public void setValidationCondition(Predicate<T> validationCondition) {
		this.validationCondition = validationCondition;
	}

	public void setCombinedValidationCondition(Predicate<Void> combinedValidationCondition) {
		this.combinedValidationCondition = combinedValidationCondition;
	}

	protected abstract void validate();
	protected abstract void validateCombinedConditions();

	protected void markAsRequired(boolean isRequired, Control control) {
		if (isRequired) {
			control.getStyleClass().add("required-field");
		} else {
			control.getStyleClass().remove("required-field");
		}
	}

}
