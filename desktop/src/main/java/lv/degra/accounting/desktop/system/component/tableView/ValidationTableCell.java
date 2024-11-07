package lv.degra.accounting.desktop.system.component.tableView;

import java.util.function.Predicate;

import javafx.scene.control.TableCell;

public class ValidationTableCell<S, T> extends TableCell<S, T> {
	private final Predicate<T> validationPredicate;

	public ValidationTableCell(Predicate<T> validationPredicate) {
		this.validationPredicate = validationPredicate;
	}

	@Override
	protected void updateItem(T item, boolean empty) {
		super.updateItem(item, empty);
		if (empty || item == null) {
			setText(null);
			setStyle("");
		} else {
			setText(item.toString());
			if (!validationPredicate.test(item)) {
				// Norāda stilu nederīgām vērtībām (piemēram, sarkans fons)
				setStyle("-fx-background-color: lightcoral;");
			} else {
				setStyle(""); // Atjauno noklusējuma stilu, ja vērtība ir derīga
			}
		}
	}
}
