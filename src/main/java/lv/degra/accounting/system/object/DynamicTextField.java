package lv.degra.accounting.system.object;

import javafx.beans.value.ChangeListener;
import javafx.beans.value.ObservableValue;

public class DynamicTextField extends javafx.scene.control.TextField {

	private final Runnable onUnfocus;

	public DynamicTextField(Runnable onUnfocus) {
		super();

		this.onUnfocus = onUnfocus;

		this.focusedProperty().addListener(new ChangeListener<Boolean>() {
			@Override
			public void changed(ObservableValue<? extends Boolean> observable, Boolean oldValue, Boolean newValue) {
				if (!newValue) {
					onUnfocus.run();
				}
			}
		});
	}
}
