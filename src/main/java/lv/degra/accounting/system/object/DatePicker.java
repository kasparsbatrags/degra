package lv.degra.accounting.system.object;

import javafx.scene.input.KeyCode;
		import javafx.scene.input.KeyEvent;

public class DatePicker extends javafx.scene.control.DatePicker {

	public DatePicker() {
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