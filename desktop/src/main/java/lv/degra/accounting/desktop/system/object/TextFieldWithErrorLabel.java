package lv.degra.accounting.desktop.system.object;

import java.util.function.Predicate;

import javafx.scene.control.TextField;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class TextFieldWithErrorLabel extends ControlWithErrorLabel<String> {

	private final TextField textField;

	public TextFieldWithErrorLabel() {
		super(new TextField());
		textField = new TextField();
		textField.setMaxWidth(Double.MAX_VALUE);

		textField.textProperty().addListener((observable, oldValue, newValue) -> validate());
		validate();
		getChildren().add(0, textField);
	}

	public String getText() {
		return this.textField.getText();
	}

	public void setText(String value) {
		this.textField.setText(value);
	}

	@Override
	protected String getValue() {
		return textField.getText();
	}

	@Override
	public void setValidationCondition(Predicate<String> validationCondition, String errorMessage) {
		validationConditions.put(validationCondition, errorMessage);
		markAsRequired(validationCondition != null, textField);

	}

}
