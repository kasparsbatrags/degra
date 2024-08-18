package lv.degra.accounting.desktop.system.component;

import java.util.function.Predicate;

import org.kordamp.ikonli.javafx.FontIcon;
import org.kordamp.ikonli.materialdesign.MaterialDesign;

import javafx.beans.property.ObjectProperty;
import javafx.collections.ObservableList;
import javafx.event.ActionEvent;
import javafx.event.EventHandler;
import javafx.scene.control.Button;
import javafx.scene.control.ComboBox;
import javafx.scene.control.ListCell;
import javafx.scene.control.ListView;
import javafx.scene.control.SingleSelectionModel;
import javafx.scene.control.TextField;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Priority;
import javafx.util.Callback;
import javafx.util.StringConverter;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class ComboBoxWithErrorLabel<T> extends ControlWithErrorLabel<T> {

	private final ComboBox<T> comboBox;
	private Button clearButton = new Button();

	public ComboBoxWithErrorLabel() {
		super(new ComboBox<T>());
		this.comboBox = (ComboBox<T>) this.control; // Ensure the superclass uses this ComboBox
		comboBox.setMaxWidth(Double.MAX_VALUE);

		comboBox.valueProperty().addListener((observable, oldValue, newValue) -> validate());

		FontIcon icon = new FontIcon(MaterialDesign.MDI_CLOSE);
		icon.setIconSize(20);
		clearButton.setGraphic(icon);
		clearButton.setOnAction(e -> comboBox.setValue(null));

		validate();

		HBox comboBoxContainer = new HBox();
		comboBoxContainer.getChildren().addAll(comboBox, clearButton);

		HBox.setHgrow(comboBox, Priority.ALWAYS);
		clearButton.setMinHeight(comboBox.getHeight());
		clearButton.setPrefHeight(comboBox.getHeight());
		clearButton.setMaxHeight(Double.MAX_VALUE);
		clearButton.prefWidthProperty().bind(clearButton.heightProperty());

		getChildren().add(0, comboBoxContainer);
	}

	public void setOnClearButtonAction(EventHandler<ActionEvent> handler) {
		clearButton.setOnAction(handler);
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

	public void setItems(ObservableList<T> items) {
		this.comboBox.setItems(items);
	}

	public SingleSelectionModel<T> getSelectionModel() {
		return comboBox.getSelectionModel();
	}

	public void hide() {
		comboBox.hide();
	}

	public void show() {
		comboBox.show();
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
