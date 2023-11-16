package lv.degra.accounting.system.object;

import static org.apache.commons.lang3.StringUtils.SPACE;

import java.lang.reflect.Field;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import javafx.beans.value.ObservableValue;
import javafx.collections.ObservableList;
import javafx.scene.control.TableColumn;
import javafx.scene.control.TableView;
import javafx.scene.control.cell.PropertyValueFactory;
import lv.degra.accounting.document.enums.DirectionEnumCellFactory;
import lv.degra.accounting.document.enums.DocumentDirection;
import lv.degra.accounting.system.exception.DynamicTableBuildException;

public class DynamicTableView<T> extends TableView<T> {

	public DynamicTableView() {
		super();
	}


	public void setData(List<T> data) {
		try {
			T firstObject = data.get(0);
			Field[] fields = firstObject.getClass().getDeclaredFields();

			List<Field> fieldList = Arrays.stream(fields)
					.filter(field -> field.getAnnotation(ShowInTableView.class) != null)
					.sorted(Comparator.comparingInt(field -> field.getAnnotation(ShowInTableView.class).columnOrder()))
					.toList();

			fieldList.forEach(field -> {
				DisplayName displayNameAnnotation = field.getAnnotation(DisplayName.class);
				String columnDisplayName = (displayNameAnnotation != null) ? displayNameAnnotation.value() : field.getName();

				TableColumn<T, ?> column = createColumn(columnDisplayName, field);
				getColumns().add(column);
			});
		} catch (RuntimeException e) {
			throw new DynamicTableBuildException(e.getMessage() + SPACE + e.getCause());
		}
		setItems((ObservableList<T>) data);
	}


	private <T, S> TableColumn<T, S> createColumn(String propertyName, Field field) {
		TableColumn<T, S> column = new TableColumn<>(propertyName);
		column.setCellValueFactory(param -> {
			try {
				field.setAccessible(true);
				Object value = field.get(param.getValue());
				return (ObservableValue<S>) new PropertyValueFactory<T, S>(field.getName());
			} catch (IllegalAccessException e) {
				e.printStackTrace();
				return null;
			}
		});
		if (field.getType() == DocumentDirection.class) {
			column.setCellFactory(new DirectionEnumCellFactory());
		}
		column.setCellValueFactory(new PropertyValueFactory<>(field.getName()));
		return column;
	}
}
