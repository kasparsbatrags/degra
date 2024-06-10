package lv.degra.accounting.system.object;

import static lv.degra.accounting.system.configuration.DegraConfig.DATE_FORMAT;
import static lv.degra.accounting.system.configuration.DegraConfig.FIELD_REQUIRED;
import static org.apache.commons.lang3.StringUtils.EMPTY;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.function.Predicate;

import javafx.beans.property.BooleanProperty;
import javafx.scene.control.DatePicker;
import javafx.scene.input.KeyCode;
import javafx.scene.input.KeyEvent;
import javafx.util.StringConverter;
import lv.degra.accounting.document.controller.DocumentMainController;

public class DatePickerWithErrorLabel extends ControlWithErrorLabel<LocalDate> implements DataSavable {

	private final DatePicker datePicker;

	public DatePickerWithErrorLabel() {

		datePicker = new DatePicker();

		datePicker.valueProperty().addListener((observable, oldValue, newValue) -> {
			if (oldValue != newValue) {
				dataSaved.set(false);
				validate();
			}

//			validateCombinedConditions();
		});
		validate();
//		validateCombinedConditions();

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

		DocumentMainController.addToDataSavableFields(this);
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
	protected void validateCombinedConditions() {
		boolean isValid = true;
		if (validationCondition != null) {
			isValid = validationCondition.test(datePicker.getValue());
		}
		setValid(isValid);
		setErrorText(isValid ? EMPTY : FIELD_REQUIRED);
		markAsRequired(!isValid);
	}

	@Override
	protected void validate() {
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

	@Override
	public boolean isDataSaved() {
		return dataSaved.get();
	}

	@Override
	public void setDataSaved(boolean dataSaved) {
		this.dataSaved.set(dataSaved);
	}

	@Override
	public BooleanProperty dataSavedProperty() {
		return dataSaved;
	}

}