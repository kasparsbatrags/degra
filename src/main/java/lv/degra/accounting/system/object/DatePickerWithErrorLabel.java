package lv.degra.accounting.system.object;

import static lv.degra.accounting.configuration.DegraConfig.DATE_FORMAT;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import javafx.scene.control.DatePicker;
import javafx.scene.input.KeyCode;
import javafx.scene.input.KeyEvent;
import javafx.scene.layout.VBox;
import javafx.util.StringConverter;
import lv.degra.accounting.document.controller.Validatable;

public class DatePickerWithErrorLabel extends VBox implements Validatable {

	private final DatePicker datePicker;
	private final javafx.scene.control.Label errorLabel;

	public DatePickerWithErrorLabel() {

		datePicker = new DatePicker();
		datePicker.getStyleClass().add("custom-date-picker");
		errorLabel = new Label();

		errorLabel.setStyle("-fx-text-fill: red;");

		datePicker.valueProperty().addListener((observable, oldValue, newValue) -> {
			if (oldValue!=newValue) {
				clearError();
			}
		});

		DateTimeFormatter formatter = DateTimeFormatter.ofPattern(DATE_FORMAT);
		StringConverter<LocalDate> converter = new StringConverter<LocalDate>() {
			@Override
			public String toString(LocalDate date) {
				if (date != null) {
					return formatter.format(date);
				} else {
					return "";
				}
			}

			@Override
			public LocalDate fromString(String string) {
				if (string != null && !string.isEmpty()) {
					return LocalDate.parse(string, formatter);
				} else {
					return null;
				}
			}
		};
		datePicker.setConverter(converter);

		this.addEventHandler(KeyEvent.KEY_PRESSED, event -> {
			if (event.getCode() == KeyCode.F4) {
				datePicker.show();
				datePicker.requestFocus();
				event.consume();
			}
		});

		this.getChildren().addAll(datePicker, errorLabel);

	}

	public java.time.LocalDate getValue() {
		return datePicker.getValue();
	}

	public void setValue(java.time.LocalDate date) {
		datePicker.setValue(date);
	}

	public void clearError() {
		errorLabel.setText("");
	}

	public void setError(String errorMessage) {
		errorLabel.setText(errorMessage);
	}

}