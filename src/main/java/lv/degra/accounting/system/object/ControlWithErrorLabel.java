package lv.degra.accounting.system.object;

import static lv.degra.accounting.system.configuration.DegraConfig.FIELD_REQUIRED_MESSAGE;
import static org.apache.commons.lang3.StringUtils.EMPTY;

import java.util.HashMap;
import java.util.Map;
import java.util.function.Predicate;

import javafx.beans.property.BooleanProperty;
import javafx.beans.property.ObjectProperty;
import javafx.beans.property.ObjectPropertyBase;
import javafx.beans.property.SimpleBooleanProperty;
import javafx.event.ActionEvent;
import javafx.event.EventHandler;
import javafx.scene.control.Control;
import javafx.scene.control.Label;
import javafx.scene.layout.VBox;
import lombok.Setter;

public abstract class ControlWithErrorLabel<T> extends VBox {
	protected Label errorLabel;
	protected BooleanProperty valid;
	protected BooleanProperty required;
	@Setter
	protected Map<Predicate<T>, String> validationConditions = new HashMap<>();
	protected Control control;
	private final ObjectProperty<EventHandler<ActionEvent>> onAction = new ObjectPropertyBase<>() {
		@Override
		protected void invalidated() {
			if (control instanceof javafx.scene.control.ComboBox) {
				((javafx.scene.control.ComboBox<?>) control).setOnAction(get());
			} else if (control instanceof javafx.scene.control.TextField) {
				((javafx.scene.control.TextField) control).setOnAction(get());
			}
		}

		@Override
		public Object getBean() {
			return ControlWithErrorLabel.this;
		}

		@Override
		public String getName() {
			return "onAction";
		}
	};

	protected ControlWithErrorLabel(Control control) {
		this.control = control;
		errorLabel = new Label();
		valid = new SimpleBooleanProperty(true);
		required = new SimpleBooleanProperty(false);
		errorLabel.setStyle("-fx-text-fill: red;");
		this.getChildren().add(errorLabel);
		errorLabel.setVisible(false);
	}

	public String getErrorText() {
		return errorLabel.getText();
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

	public boolean isRequired() {
		return required.get();
	}

	public void setRequired(boolean isRequired) {
		this.required.set(isRequired);
	}

	public void validate() {
		boolean isValid = true;
		T value = getValue();

		if (isRequired() && (value == null || value.toString().trim().isEmpty())) {
			isValid = false;
			setErrorText(FIELD_REQUIRED_MESSAGE);
		} else {

			for (Map.Entry<Predicate<T>, String> entry : validationConditions.entrySet()) {
				if (!entry.getKey().test(value)) {
					isValid = false;
					setErrorText(entry.getValue());
					break;
				}
			}
			if (isValid) {
				setErrorText(EMPTY);
			}
		}

		setValid(isValid);
	}

	protected abstract T getValue();

	protected void markAsRequired(boolean isRequired, Control control) {
		if (isRequired) {
			control.getStyleClass().add("required-field");
		} else {
			control.getStyleClass().remove("required-field");
		}
	}

	public final ObjectProperty<EventHandler<ActionEvent>> onActionProperty() {
		return onAction;
	}

	public final EventHandler<ActionEvent> getOnAction() {
		return onAction.get();
	}

	public final void setOnAction(EventHandler<ActionEvent> value) {
		onAction.set(value);
	}

	public abstract void setValidationCondition(Predicate<T> validationCondition, String errorMessage);

}
