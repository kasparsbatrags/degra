package lv.degra.accounting.desktop.system.object;

import java.util.function.Predicate;

import javafx.scene.control.TextArea;
import javafx.scene.control.TextField;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class TextAreaWithErrorLabel extends ControlWithErrorLabel<String> {

	private final TextArea textArea;

	public TextAreaWithErrorLabel() {
		super(new TextField());
		textArea = new TextArea();
		textArea.setMaxWidth(Double.MAX_VALUE);

		textArea.textProperty().addListener((observable, oldValue, newValue) -> validate());
		validate();
		getChildren().add(0, textArea);
	}

	public String getText() {
		return this.textArea.getText();
	}

	public void setText(String value) {
		this.textArea.setText(value);
	}

	@Override
	protected String getValue() {
		return textArea.getText();
	}

	@Override
	public void setValidationCondition(Predicate<String> validationCondition, String errorMessage) {
		validationConditions.put(validationCondition, errorMessage);
		markAsRequired(validationCondition != null, textArea);

	}

}
