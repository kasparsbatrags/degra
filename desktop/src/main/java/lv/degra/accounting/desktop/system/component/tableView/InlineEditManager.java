package lv.degra.accounting.desktop.system.component.tableView;

import java.lang.reflect.Field;
import java.util.function.Predicate;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.validation.constraints.NotNull;
import javafx.scene.control.TableColumn;
import javafx.scene.control.cell.TextFieldTableCell;
import javafx.util.StringConverter;
import lv.degra.accounting.desktop.system.component.Saver;
import lv.degra.accounting.desktop.system.component.Updater;

public class InlineEditManager<T> {
	private static final Logger log = LoggerFactory.getLogger(InlineEditManager.class);
	private final DynamicTableView<T> tableView;

	public InlineEditManager(DynamicTableView<T> tableView) {
		this.tableView = tableView;
	}

	public <S> void setupEditableColumn(TableColumn<T, S> column, Field field, Saver<T> saver, Updater<T> updater) {

		if (field.getAnnotation(NotNull.class) != null) {
			Predicate<Object> validation = obj -> obj != null;

			column.setCellFactory(col -> new TextFieldTableCell<T, S>(createStringConverter(field)) {
				@Override
				public void updateItem(S item, boolean empty) {
					super.updateItem(item, empty);
					if (empty || item == null) {
						setText(null);
					} else {
						setText(item.toString());
						if (!validation.test(item)) {
							setStyle("-fx-background-color: red;");
						}
					}
				}

				@Override
				public void commitEdit(S newValue) {
					if (validation.test(newValue)) {
						super.commitEdit(newValue); // Apstiprina vērtību
					} else {
						log.warn("Validation failed for field: {} with value: {}", field.getName(), newValue);
						setStyle("-fx-background-color: red;");
					}
				}
			});

			column.setOnEditCommit(event -> {
				T rowItem = event.getRowValue();
				S newValue = event.getNewValue();
				if (validation.test(newValue)) {
					if (validation.test(newValue)) {
						try {
							field.setAccessible(true);
							field.set(rowItem, event.getNewValue());
							if (rowItem != null && updater != null) {
								saver.save(rowItem);
							}
						} catch (IllegalAccessException e) {
							log.error(e.toString());
						}
					}
				} else {

					log.warn("Validation failed for field: {} with value: {}", field.getName(), newValue);
				}
				tableView.refresh();
			});
		}
	}

	private <S> StringConverter<S> createStringConverter(Field field) {
		return new StringConverter<>() {
			@Override
			public String toString(S object) {
				return object != null ? object.toString() : "";
			}

			@Override
			public S fromString(String string) {
				try {
					if (field.getType() == Integer.class) {
						return (S) Integer.valueOf(string);
					} else if (field.getType() == Double.class) {
						return (S) Double.valueOf(string);
					} else if (field.getType() == Boolean.class) {
						return (S) Boolean.valueOf(string);
					}
					return (S) string;
				} catch (Exception e) {
					log.error("Failed to convert value: {}", e.getMessage());
					return null;
				}
			}
		};
	}
}
