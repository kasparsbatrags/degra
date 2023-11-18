package lv.degra.accounting.system.object;

import static org.apache.commons.lang3.StringUtils.SPACE;

import java.lang.reflect.Field;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.function.Function;

import javafx.beans.property.SimpleStringProperty;
import javafx.beans.value.ObservableValue;
import javafx.collections.ObservableList;
import javafx.scene.control.TableColumn;
import javafx.scene.control.TableView;
import javafx.scene.control.cell.PropertyValueFactory;
import lombok.extern.slf4j.Slf4j;
import lv.degra.accounting.document.enums.DirectionEnumCellFactory;
import lv.degra.accounting.document.enums.DocumentDirection;
import lv.degra.accounting.exchange.model.CurrencyExchangeRate;
import lv.degra.accounting.system.exception.DynamicTableBuildException;

@Slf4j
public class DynamicTableView<T> extends TableView<T> {

	public DynamicTableView() {
		super();
	}

	public void setData(List<T> data) {
		try {
			getColumns().clear();
			T firstObject = data.get(0);
			Field[] fields = firstObject.getClass().getDeclaredFields();

			List<Field> fieldList = Arrays.stream(fields).filter(field -> field.getAnnotation(TableViewInfo.class) != null)
					.sorted(Comparator.comparingInt(field -> field.getAnnotation(TableViewInfo.class).columnOrder())).toList();

			fieldList.forEach(field -> {
				TableViewInfo tableViewInfo = field.getAnnotation(TableViewInfo.class);
				String columnDisplayName = (tableViewInfo != null) ? tableViewInfo.displayName() : field.getName();

				TableColumn<T, ?> column = buildColumn(columnDisplayName, field);
				getColumns().add(column);
			});
		} catch (RuntimeException e) {
			throw new DynamicTableBuildException(e.getMessage() + SPACE + e.getCause());
		}
		setItems((ObservableList<T>) data);
	}

	private TableColumn<T, ?> buildColumn(String columnDisplayName, Field field) {

		TableColumn<T, ?> column;
		if (field.getType().equals(CurrencyExchangeRate.class)) {
			column = createRelatedObjectsColumn(columnDisplayName, field, CurrencyExchangeRate::getRate);
		} else {
			column = createColumn(columnDisplayName, field);
			column.setCellValueFactory(new PropertyValueFactory<>(field.getName()));
		}

		return column;
	}

	private <T, S, U> TableColumn<T, String> createRelatedObjectsColumn(String propertyName, Field field,
			Function<U, S> nestedPropertyGetter) {
		TableColumn<T, String> column = new TableColumn<>(propertyName);
		column.setCellValueFactory(param -> {
			try {
				field.setAccessible(true);
				Object value = field.get(param.getValue());
				if (value != null) {
					S nestedProperty = nestedPropertyGetter.apply((U) value);
					return new SimpleStringProperty(nestedProperty.toString());
				} else {
					return new SimpleStringProperty("");
				}
			} catch (Exception e) {
				e.printStackTrace();
				return null;
			}
		});
		return column;
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
		return column;
	}
}
