package lv.degra.accounting.system.object;

import static lv.degra.accounting.system.configuration.DegraConfig.DATE_FORMAT;
import static lv.degra.accounting.system.configuration.DegraConfig.FIELD_REQUIRED;
import static org.apache.commons.lang3.StringUtils.EMPTY;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.function.Predicate;

import javafx.scene.control.DatePicker;
import javafx.scene.input.KeyCode;
import javafx.scene.input.KeyEvent;
import javafx.util.StringConverter;

public class DatePickerWithErrorLabel extends ControlWithErrorLabel<LocalDate> {

	private final DatePicker datePicker;

	public DatePickerWithErrorLabel() {

		datePicker = new DatePicker();

		datePicker.valueProperty().addListener((observable, oldValue, newValue) -> {
			validate();
		});
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

		this.getChildren().add(0, datePicker);
	}

	public java.time.LocalDate getValue() {
		return datePicker.getValue();
	}

	public void setValue(java.time.LocalDate date) {
		datePicker.setValue(date);
	}

	@Override
	public void setValidationCondition(Predicate<LocalDate> validationCondition) {
		this.validationCondition = validationCondition;
		markAsRequired(this.validationCondition != null);
	}

	@Override
	public void validate() {
		boolean isValid = true;
		if (validationCondition != null) {
			isValid = validationCondition.test(datePicker.getValue());
		}
		setValid(isValid);
		setErrorText(isValid ? EMPTY : FIELD_REQUIRED);
		markAsRequired(!isValid);
	}

	public void markAsRequired(boolean isRequired) {
		super.markAsRequired(isRequired, datePicker);
	}
}
