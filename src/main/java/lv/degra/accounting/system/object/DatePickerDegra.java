package lv.degra.accounting.system.object;

import javafx.scene.control.DatePicker;
		import javafx.scene.input.KeyCode;
		import javafx.scene.input.KeyEvent;

public class DatePickerDegra extends DatePicker {

	public DatePickerDegra() {
		super();

		this.addEventHandler(KeyEvent.KEY_PRESSED, event -> {
			if (event.getCode() == KeyCode.F4) {
				this.show();
				this.requestFocus();
				event.consume();
			}
		});
	}
}