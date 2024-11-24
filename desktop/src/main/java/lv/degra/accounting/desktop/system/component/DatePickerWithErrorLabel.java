package lv.degra.accounting.desktop.system.component;

import static lv.degra.accounting.desktop.system.configuration.DegraDesktopConfig.DATE_FORMAT;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.function.Predicate;

import javafx.scene.control.DatePicker;
import javafx.scene.input.KeyCode;
import javafx.scene.input.KeyEvent;
import javafx.util.StringConverter;
import lv.degra.accounting.desktop.system.component.lazycombo.ControlWithErrorLabel;

public class DatePickerWithErrorLabel extends ControlWithErrorLabel<LocalDate> {

	private final DatePicker datePicker;

	public DatePickerWithErrorLabel() {
		super(new DatePicker());
		datePicker = new DatePicker();

		datePicker.valueProperty().addListener((observable, oldValue, newValue) -> validate());
		validate();

		DateTimeFormatter formatter = DateTimeFormatter.ofPattern(DATE_FORMAT);
		StringConverter<LocalDate> converter = new StringConverter<>() {
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

		this.getChildren().addFirst(datePicker);
	}

	public java.time.LocalDate getValue() {
		return datePicker.getValue();
	}

	public void setValue(java.time.LocalDate date) {
		datePicker.setValue(date);
	}

	@Override
	public void setValidationCondition(Predicate<LocalDate> validationCondition, String errorMessage) {
		validationConditions.put(validationCondition, errorMessage);
		markAsRequired(validationCondition != null, datePicker);
	}

	@Override
	public void removeValidationCondition(String errorMessage) {
		validationConditions.entrySet().removeIf(entry->entry.getValue().equals(errorMessage));
	}

}
