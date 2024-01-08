package lv.degra.accounting.system.object;

import javafx.scene.input.KeyCode;
import javafx.scene.input.KeyEvent;

public class DynamicDatePicker extends javafx.scene.control.DatePicker {

	public DynamicDatePicker() {
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