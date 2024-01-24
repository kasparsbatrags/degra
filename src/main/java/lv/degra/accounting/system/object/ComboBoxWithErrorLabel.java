package lv.degra.accounting.system.object;

import javafx.collections.ObservableList;
import javafx.event.ActionEvent;
import javafx.event.EventHandler;
import javafx.scene.control.ComboBox;
import javafx.scene.control.ListCell;
import javafx.scene.control.ListView;
import javafx.scene.layout.VBox;
import javafx.util.Callback;

public class ComboBoxWithErrorLabel<T> extends VBox {

	private final ComboBox<T> comboBox;
	private final Label errorLabel;

	public ComboBoxWithErrorLabel() {
		comboBox = new ComboBox<>();
		errorLabel = new Label();
		errorLabel.setStyle("-fx-text-fill: red;");

		comboBox.valueProperty().addListener((observable, oldValue, newValue) -> {
			if (oldValue != newValue) {
				clearError();
			}
		});

		getChildren().addAll(comboBox, errorLabel);
	}

	public void setOnAction(EventHandler<ActionEvent> eventHandler) {
		this.comboBox.setOnAction(eventHandler);
	}

	public T getValue() {
		return this.comboBox.getValue();
	}

	public void setValue(T value) {
		this.comboBox.setValue(value);
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

	public void clearError() {
		errorLabel.setText("");
	}

	public void setError(String errorMessage) {
		errorLabel.setText(errorMessage);
	}
}
