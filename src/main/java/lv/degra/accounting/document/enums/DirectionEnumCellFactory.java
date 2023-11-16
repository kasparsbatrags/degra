package lv.degra.accounting.document.enums;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

import javafx.scene.control.TableCell;
import javafx.scene.control.TableColumn;
import javafx.util.Callback;

public class DirectionEnumCellFactory<T, DocumentDirection> implements Callback<TableColumn<T, DocumentDirection>, TableCell<T, DocumentDirection>> {
	@Override
	public TableCell<T, DocumentDirection> call(TableColumn<T, DocumentDirection> param) {
		return new TableCell<T, DocumentDirection>() {
			@Override
			protected void updateItem(DocumentDirection item, boolean empty) {
				super.updateItem(item, empty);

				if (empty || item == null) {
					setText(null);
				} else {
					try {
						Method method = item.getClass().getMethod("getDisplayName");
						String displayName = (String) method.invoke(item);
						setText(displayName);
					} catch (NoSuchMethodException | IllegalAccessException | InvocationTargetException e) {
						e.printStackTrace();
					}
				}
			}
		};
	}
}