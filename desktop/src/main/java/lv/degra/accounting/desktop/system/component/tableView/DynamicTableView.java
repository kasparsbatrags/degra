package lv.degra.accounting.desktop.system.component.tableView;

import static lv.degra.accounting.desktop.system.configuration.DegraDesktopConfig.DELETE_QUESTION_CONTEXT_TEXT;
import static lv.degra.accounting.desktop.system.configuration.DegraDesktopConfig.DELETE_QUESTION_HEADER_TEXT;
import static org.apache.commons.lang3.StringUtils.SPACE;

import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.function.Consumer;

import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.stereotype.Component;

import jakarta.validation.constraints.NotNull;
import javafx.beans.property.SimpleStringProperty;
import javafx.beans.value.ObservableValue;
import javafx.collections.ObservableList;
import javafx.geometry.Pos;
import javafx.scene.control.ContextMenu;
import javafx.scene.control.MenuItem;
import javafx.scene.control.TableCell;
import javafx.scene.control.TableColumn;
import javafx.scene.control.TableView;
import javafx.scene.control.cell.PropertyValueFactory;
import javafx.scene.control.cell.TextFieldTableCell;
import javafx.scene.input.MouseButton;
import javafx.scene.input.MouseEvent;
import javafx.util.Pair;
import javafx.util.StringConverter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import lv.degra.accounting.core.account.chart.service.AccountCodeChartService;
import lv.degra.accounting.core.system.DataFetchService;
import lv.degra.accounting.core.system.component.TableViewInfo;
import lv.degra.accounting.core.system.exception.IllegalDataArgumentException;
import lv.degra.accounting.desktop.system.alert.AlertAsk;
import lv.degra.accounting.desktop.system.alert.AlertResponseType;
import lv.degra.accounting.desktop.system.component.Creator;
import lv.degra.accounting.desktop.system.component.Deleter;
import lv.degra.accounting.desktop.system.component.Saver;
import lv.degra.accounting.desktop.system.component.Updater;
import lv.degra.accounting.desktop.system.component.lazycombo.SearchableComboBoxForGrid;
import lv.degra.accounting.desktop.system.component.lazycombo.accountchart.AccountCodeChartStringConverter;
import lv.degra.accounting.desktop.system.exception.DynamicTableBuildException;

@Slf4j
@Component
@Setter
public class DynamicTableView<T> extends TableView<T> implements ApplicationContextAware {
	private static final int MIN_ACCOUNT_CODE_SEARCH_SYMBOL_COUNT = 1;
	private static final double COLUMN_MIN_WIDTH = 150;
	private static ApplicationContext applicationContext;
	private Class<T> type;
	private Creator<T> creator;
	private Updater<T> updater;
	private Deleter<T> deleter;
	private Saver<T> saver;
	private ContextMenu activeContextMenu;
	private InlineEditManager<T> inlineEditManager;

	public DynamicTableView() {
		this.inlineEditManager = new InlineEditManager<>(this);
		this.setColumnResizePolicy(UNCONSTRAINED_RESIZE_POLICY);
		this.setOnMouseClicked(event -> {
			if (event.getClickCount() == 2) {
				T item = this.getSelectionModel().getSelectedItem();
				updater.update(item);
			}
		});
		this.addEventHandler(MouseEvent.MOUSE_CLICKED, this::handleRightClick);
	}

	@Override
	public void setApplicationContext(ApplicationContext context) {
		applicationContext = context;
	}

	public void setData(List<T> data) {
		boolean dataIsEmpty = data.isEmpty();
		if (dataIsEmpty) {
			if (type == null) {
				throw new IllegalStateException("Type is null. You must pass a Class<T> object to the DynamicTableView constructor.");
			}
			try {
				T instance = type.getDeclaredConstructor().newInstance();
				data = new ArrayList<>();
				data.add(instance);
			} catch (Exception e) {
				throw new IllegalDataArgumentException(e.getCause() + SPACE + e.getMessage());
			}
		}

		try {
			getColumns().clear();
			T firstObject = data.getFirst();
			Field[] fields = firstObject.getClass().getDeclaredFields();

			List<Field> fieldList = Arrays.stream(fields).filter(field -> field.getAnnotation(TableViewInfo.class) != null)
					.sorted(Comparator.comparingInt(field -> field.getAnnotation(TableViewInfo.class).columnOrder())).toList();

			fieldList.forEach(field -> {
				TableViewInfo tableViewInfoAnotation = field.getAnnotation(TableViewInfo.class);
				String columnDisplayName = (tableViewInfoAnotation != null) ? tableViewInfoAnotation.displayName() : field.getName();
				String methodName = getNestedPropertyMethodName(tableViewInfoAnotation);

				TableColumn<T, ?> column = tableViewInfoAnotation != null && tableViewInfoAnotation.useAsSearchComboBox() ?
						buildSearchableComboBoxColumn(columnDisplayName, field) :
						buildColumn(columnDisplayName, field, methodName);

				if (tableViewInfoAnotation != null && tableViewInfoAnotation.editable()) {
					column.setEditable(true);
					if (!tableViewInfoAnotation.useAsSearchComboBox()) {
						inlineEditManager.setupEditableColumn(column, field, saver, updater);
					}
				}

				if (tableViewInfoAnotation.columnWidth() != 0) {
					column.setMinWidth(tableViewInfoAnotation.columnWidth());
				} else {
					column.setMaxWidth(COLUMN_MIN_WIDTH);
				}
				getColumns().add(column);
			});

		} catch (RuntimeException e) {
			throw new DynamicTableBuildException(e.getMessage() + SPACE + e.getCause());
		}
		if (!dataIsEmpty) {
			setItems((ObservableList<T>) data);
		}
	}

	private String getNestedPropertyMethodName(TableViewInfo annotation) {
		return annotation !=null && annotation.nestedPropertyMethod().isEmpty() ? "toString" : annotation.nestedPropertyMethod();
	}

	private <T, U, S> TableColumn<T, ?> buildColumn(String columnDisplayName, Field field, String getMethodName) {
		TableColumn<T, ?> column;
		if (isFieldFromPackage(field)) {
			column = createRelatedObjectsColumn(columnDisplayName, field, getMethodName);
		} else {
			column = createColumn(columnDisplayName, field);
		}
		return column;
	}

	private TableColumn<T, ?> buildSearchableComboBoxColumn(String columnDisplayName, Field field) {
		TableColumn<T, T> column = new TableColumn<>(columnDisplayName);
		column.setCellValueFactory(new PropertyValueFactory<>(field.getName()));

		column.setCellFactory(col -> {
			SearchableComboBoxForGrid<T> comboBox = new SearchableComboBoxForGrid<>();
			comboBox.hideErrorLabel();
			try {
				Object dataFetchService = getDataService(field);
				if (dataFetchService instanceof AccountCodeChartService) {
					comboBox.setMinSearchCharCount(MIN_ACCOUNT_CODE_SEARCH_SYMBOL_COUNT);
					comboBox.setDataFetchService((DataFetchService<T>) dataFetchService);
					comboBox.setConverter(
							(StringConverter<T>) new AccountCodeChartStringConverter((AccountCodeChartService) dataFetchService));
				}
			} catch (Exception e) {
				log.error(e.toString());
			}

			TableCell<T, T> cell = new TableCell<>() {
				@Override
				protected void updateItem(T item, boolean empty) {
					super.updateItem(item, empty);
					if (empty) {
						setGraphic(null);
					} else {
						comboBox.setValue(item);
						setGraphic(comboBox);
					}
				}
			};
			cell.setAlignment(Pos.CENTER);

			if (field.getAnnotation(NotNull.class) != null) {
				comboBox.valueProperty().addListener((obs, oldVal, newVal) -> {
					if (cell.getTableRow() != null && cell.getTableRow().getItem() != null) {
						try {
							if (newVal != null) {
								field.setAccessible(true);
								field.set(cell.getTableRow().getItem(), newVal);
								cell.setStyle("");
							} else {
								System.out.println("Vērtība ir obligāta un nevar būt tukša.");
								cell.setStyle("-fx-background-color: red;");
							}
						} catch (IllegalAccessException e) {
							log.error(e.toString());
						}
					}
				});
			}

			comboBox.valueProperty().addListener((obs, oldVal, newVal) -> {
				if (cell.getTableRow() != null && cell.getTableRow().getItem() != null) {
					try {
						field.setAccessible(true);
						field.set(cell.getTableRow().getItem(), newVal);
					} catch (IllegalAccessException e) {
						log.error(e.toString());
					}
				}
			});

			comboBox.setOnAction(event -> {
				if (cell.getTableRow() != null && cell.getTableRow().getItem() != null) {
					try {
						field.setAccessible(true);
						field.set(cell.getTableRow().getItem(), comboBox.getValue());
					} catch (IllegalAccessException e) {
						log.error(e.toString());
					}
				}
			});

			return cell;
		});

		return column;
	}

	private Object getDataService(Field field) {
		TableViewInfo tableViewInfo = field.getAnnotation(TableViewInfo.class);
		Class<?> serviceClass = tableViewInfo.searchServiceClass();
		return applicationContext.getBean(serviceClass);
	}

	private <T> TableColumn<T, String> createRelatedObjectsColumn(String propertyName, Field field, String methodName) {
		TableColumn<T, String> column = new TableColumn<>(propertyName);
		column.setCellValueFactory(param -> {
			try {
				field.setAccessible(true);
				Object value = field.get(param.getValue());
				if (value != null) {
					Method method = value.getClass().getMethod(methodName);
					Object nestedProperty = method.invoke(value);
					return new SimpleStringProperty(nestedProperty != null ? nestedProperty.toString() : "");
				} else {
					return new SimpleStringProperty("");
				}
			} catch (Exception e) {
				log.error(e.toString());
				return new SimpleStringProperty("");
			}
		});
		return column;
	}

	private <T, S> TableColumn<T, S> createColumn(String propertyName, Field field) {
		TableColumn<T, S> column = new TableColumn<>(propertyName);
		column.setCellValueFactory(param -> {
			field.setAccessible(true);
			return (ObservableValue<S>) new PropertyValueFactory<T, S>(field.getName());
		});
		column.setCellValueFactory(new PropertyValueFactory<>(field.getName()));
		column.setCellFactory(col -> {
			TextFieldTableCell<T, S> cell = new TextFieldTableCell<>(new StringConverter<>() {
				@Override
				public String toString(Object object) {
					return object != null ? object.toString() : "";
				}

				@Override
				public S fromString(String string) {
					try {
						Constructor<?> constructor = field.getType().getConstructor(String.class);
						return (S) constructor.newInstance(string);
					} catch (NoSuchMethodException | IllegalAccessException | InstantiationException | InvocationTargetException e) {
						log.error(e.toString());
						return null;
					}
				}
			});
			return cell;
		});


		return column;
	}


	private void handleRightClick(MouseEvent event) {
		if (event.getButton() == MouseButton.SECONDARY) {
			T selectedItem = getSelectionModel().getSelectedItem();
			if (selectedItem != null) {
				if (activeContextMenu != null) {
					activeContextMenu.hide();
				}
				ContextMenu contextMenu = new ContextMenu();
				activeContextMenu = contextMenu;
				List<Pair<String, Consumer<T>>> actions = new ArrayList<>();

				actions.add(new Pair<>("Jauns", item -> creator.create(item)));
				actions.add(new Pair<>("Labot", item -> {
					updater.update(item);
					int index = getItems().indexOf(item);
					getSelectionModel().select(index);
					scrollTo(index);
				}));
				actions.add(new Pair<>("Dzēst", item -> {
					if (AlertResponseType.NO.equals(new AlertAsk(DELETE_QUESTION_HEADER_TEXT, DELETE_QUESTION_CONTEXT_TEXT).getAnswer())) {
						return;
					}
					deleter.delete(item);
					int index = getItems().indexOf(item);
					if (index != -1) {
						getSelectionModel().select(index);
						scrollTo(index);
					}
				}));

				actions.forEach(action -> {
					MenuItem menuItem = new MenuItem(action.getKey());
					menuItem.setOnAction(e -> action.getValue().accept(selectedItem));
					contextMenu.getItems().add(menuItem);
				});

				contextMenu.show(this, event.getScreenX(), event.getScreenY());
			}
		}
	}

	private boolean isFieldFromPackage(Field field) {
		Class<?> fieldType = field.getType();
		String fieldPackageName = fieldType.getPackageName();
		return fieldPackageName.startsWith("lv.degra.accounting");
	}
}