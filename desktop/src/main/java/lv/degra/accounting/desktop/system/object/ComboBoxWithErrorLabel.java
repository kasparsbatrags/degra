package lv.degra.accounting.desktop.system.object;

import java.util.function.Predicate;

import javafx.beans.property.ObjectProperty;
import javafx.collections.ObservableList;
import javafx.scene.control.ComboBox;
import javafx.scene.control.ListCell;
import javafx.scene.control.ListView;
import javafx.scene.control.SingleSelectionModel;
import javafx.scene.control.TextField;
import javafx.util.Callback;
import javafx.util.StringConverter;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class ComboBoxWithErrorLabel<T> extends ControlWithErrorLabel<T> {

	private final ComboBox<T> comboBox;

	public ComboBoxWithErrorLabel() {
		super(new ComboBox<T>());
		this.comboBox = (ComboBox<T>) this.control; // Ensure the superclass uses this ComboBox
		comboBox.setMaxWidth(Double.MAX_VALUE);

		comboBox.valueProperty().addListener((observable, oldValue, newValue) -> validate());
		validate();
		getChildren().add(0, comboBox);
	}

	public void setCellFactory(Callback<ListView<T>, ListCell<T>> factory) {
		this.comboBox.setCellFactory(factory);
	}

	public void setButtonCell(ListCell<T> value) {
		this.comboBox.setButtonCell(value);
	}

	public void setConverter(StringConverter<T> value) {
		comboBox.setConverter(value);
	}

	public void setEditable(boolean value) {
		comboBox.setEditable(value);
	}

	public void setPromptText(String value) {
		comboBox.setPromptText(value);
	}

	public ObjectProperty<T> valueProperty() {
		return comboBox.valueProperty();
	}

	public TextField getEditor() {

		return comboBox.editorProperty().get();

	}

	public boolean isShowing() {
		return comboBox.isShowing();
	}

	public ObservableList<T> getItems() {
		return comboBox.getItems();

	}

	public SingleSelectionModel<T> getSelectionModel(){
		return comboBox.getSelectionModel();
	}
	public void hide(){
		comboBox.hide();
	}

	public void show(){
		comboBox.show();
	}


	public void setItems(ObservableList<T> items) {
		this.comboBox.setItems(items);
	}

	@Override
	public T getValue() {
		return comboBox.getValue();
	}

	public void setValue(T value) {
		this.comboBox.setValue(value);
	}

	@Override
	public void setValidationCondition(Predicate<T> validationCondition, String errorMessage) {
		validationConditions.put(validationCondition, errorMessage);
		markAsRequired(validationCondition != null, comboBox);
	}
}
