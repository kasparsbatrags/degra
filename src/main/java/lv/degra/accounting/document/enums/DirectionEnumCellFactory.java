package lv.degra.accounting.document.enums;

import javafx.scene.control.TableCell;
import javafx.scene.control.TableColumn;
import javafx.util.Callback;
import lv.degra.accounting.document.model.Document;
import lv.degra.accounting.system.enums.EnumNameCellFactory;


public class DirectionEnumCellFactory implements
		Callback<TableColumn<Document, DocumentDirection>, TableCell<Document, DocumentDirection>> {
	@Override
	public TableCell<Document, DocumentDirection> call(TableColumn<Document, DocumentDirection> param) {
		return new TableCell<Document, DocumentDirection>() {
			@Override
			protected void updateItem(DocumentDirection item, boolean empty) {
				super.updateItem(item, empty);

				if (empty || item == null) {
					setText(null);
				} else {
					setText(item.getDisplayName());
				}
			}
		};
	}
}