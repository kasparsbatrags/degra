package lv.degra.accounting.system.object;

import java.util.function.Predicate;

import javafx.collections.ObservableList;
import javafx.scene.control.ComboBox;
import javafx.scene.control.ListCell;
import javafx.scene.control.ListView;
import javafx.util.Callback;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class ComboBoxWithErrorLabel<T> extends ControlWithErrorLabel<T> {

	private final ComboBox<T> comboBox;

	public ComboBoxWithErrorLabel() {
		super(new ComboBox());
		comboBox = new ComboBox<>();
		comboBox.setMaxWidth(Double.MAX_VALUE);

		comboBox.valueProperty().addListener((observable, oldValue, newValue) -> validate());
		validate();
		getChildren().add(0, comboBox);
	}

	public void setItems(ObservableList<T> items) {
		this.comboBox.setItems(items);
	}

	public void setCellFactory(Callback<ListView<T>, ListCell<T>> factory) {
		this.comboBox.setCellFactory(factory);
	}

	public void setButtonCell(ListCell<T> value) {
		this.comboBox.setButtonCell(value);
	}

	@Override
	public void setValidationCondition(Predicate<T> validationCondition) {
		this.validationCondition = validationCondition;
		markAsRequired(this.validationCondition != null, comboBox);
	}

	@Override
	public T getValue() {
		return comboBox.getValue();
	}

	public void setValue(T value) {
		this.comboBox.setValue(value);
	}
}
