package lv.degra.accounting.system.enums;

import javafx.scene.control.TableCell;
import javafx.scene.control.TableColumn;
import javafx.util.Callback;
import lv.degra.accounting.document.enums.DocumentDirection;

public abstract class EnumNameCellFactory<S, T extends Enum<T>> implements Callback<TableColumn<S, T>, TableCell<S, T>> {
	@Override
	public TableCell<S, T> call(TableColumn<S, T> param) {
		return new TableCell<S, T>() {
			@Override
			protected void updateItem(T item, boolean empty) {
				super.updateItem(item, empty);

				if (empty || item == null) {
					setText(null);
				} else {
					setText(item.toString());
				}
			}
		};
	}

	protected abstract String getEnumDisplayName(DocumentDirection documentDirection);
}