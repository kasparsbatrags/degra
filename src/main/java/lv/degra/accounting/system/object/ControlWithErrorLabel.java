package lv.degra.accounting.system.object;

import java.util.function.Predicate;

import javafx.beans.property.BooleanProperty;
import javafx.beans.property.SimpleBooleanProperty;
import javafx.scene.control.Control;
import javafx.scene.control.Label;
import javafx.scene.layout.VBox;
import lombok.Setter;

public abstract class ControlWithErrorLabel<T> extends VBox {
	protected Label errorLabel;
	protected BooleanProperty valid;
	@Setter
	protected Predicate<T> validationCondition;

	protected ControlWithErrorLabel() {
		errorLabel = new Label();
		valid = new SimpleBooleanProperty(true);
		errorLabel.setStyle("-fx-text-fill: red;");
		this.getChildren().add(errorLabel);
		errorLabel.setVisible(false);
	}

	public void setErrorText(String errorText) {
		errorLabel.setText(errorText);
		errorLabel.setVisible(!errorText.isEmpty());
	}

	public boolean isValid() {
		return valid.get();
	}

	public void setValid(boolean isValid) {
		this.valid.set(isValid);
	}

	public abstract void validate();

	protected void markAsRequired(boolean isRequired, Control control) {
		if (isRequired) {
			control.getStyleClass().add("required-field");
		} else {
			control.getStyleClass().remove("required-field");
		}
	}

}
