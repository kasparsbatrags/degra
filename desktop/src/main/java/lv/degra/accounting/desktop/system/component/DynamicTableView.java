package lv.degra.accounting.desktop.system.component;

import static lv.degra.accounting.desktop.system.configuration.DegraDesktopConfig.DELETE_QUESTION_CONTEXT_TEXT;
import static lv.degra.accounting.desktop.system.configuration.DegraDesktopConfig.DELETE_QUESTION_HEADER_TEXT;
import static org.apache.commons.lang3.StringUtils.SPACE;

import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.function.Consumer;
import java.util.function.Function;

import org.kordamp.ikonli.javafx.FontIcon;
import org.kordamp.ikonli.materialdesign.MaterialDesign;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.stereotype.Component;

import javafx.beans.property.SimpleStringProperty;
import javafx.beans.value.ObservableValue;
import javafx.collections.ObservableList;
import javafx.geometry.Pos;
import javafx.scene.control.MenuButton;
import javafx.scene.control.MenuItem;
import javafx.scene.control.TableCell;
import javafx.scene.control.TableColumn;
import javafx.scene.control.TableView;
import javafx.scene.control.cell.PropertyValueFactory;
import javafx.scene.control.cell.TextFieldTableCell;
import javafx.util.Pair;
import javafx.util.StringConverter;
import lv.degra.accounting.core.account.chart.service.AccountCodeChartService;
import lv.degra.accounting.core.exchange.model.CurrencyExchangeRate;
import lv.degra.accounting.core.system.DataFetchService;
import lv.degra.accounting.core.system.component.TableViewInfo;
import lv.degra.accounting.core.system.exception.IllegalDataArgumentException;
import lv.degra.accounting.desktop.system.alert.AlertAsk;
import lv.degra.accounting.desktop.system.alert.AlertResponseType;
import lv.degra.accounting.desktop.system.component.lazycombo.SearchableComboBoxWithErrorLabel;
import lv.degra.accounting.desktop.system.component.lazycombo.accountchart.AccountCodeChartStringConverter;
import lv.degra.accounting.desktop.system.exception.DynamicTableBuildException;

@Component
public class DynamicTableView<T> extends TableView<T> implements ApplicationContextAware {
	private static final int MIN_ACCOUNT_CODE_SEARCH_SYMBOL_COUNT = 2;
	private static ApplicationContext applicationContext;
	private Class<T> type;
	private Creator<T> creator;
	private Updater<T> updater;
	private Deleter<T> deleter;

	public DynamicTableView() {
		this.setColumnResizePolicy(UNCONSTRAINED_RESIZE_POLICY);
		this.setOnMouseClicked(event -> {
			if (event.getClickCount() == 2) {
				T item = this.getSelectionModel().getSelectedItem();
				if (item != null && updater != null) {
					updater.update(item);
				}
			}
		});
	}

	public DynamicTableView(Deleter<T> deleter, Creator<T> creator, Updater<T> updater, Class<T> type) {
		super();
	}

	@Override
	public void setApplicationContext(ApplicationContext context) {
		applicationContext = context;
	}

	public void setType(Class<T> type) {
		this.type = type;
	}

	public void setCreator(Creator<T> creator) {
		this.creator = creator;
	}

	public void setUpdater(Updater<T> updater) {
		this.updater = updater;
	}

	public void setDeleter(Deleter<T> deleter) {
		this.deleter = deleter;
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
				TableViewInfo tableViewInfo = field.getAnnotation(TableViewInfo.class);
				String columnDisplayName = (tableViewInfo != null) ? tableViewInfo.displayName() : field.getName();

				TableColumn<T, ?> column;
				if (tableViewInfo != null && tableViewInfo.useAsSearchComboBox()) {
					column = buildSearchableComboBoxColumn(columnDisplayName, field);
				} else {
					column = buildColumn(columnDisplayName, field);
				}
				getColumns().add(column);
			});
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
			TableColumn<T, Void> actionsColumn = createMenuButtonColumn(actions);
			getColumns().add(actionsColumn);

		} catch (RuntimeException e) {
			throw new DynamicTableBuildException(e.getMessage() + SPACE + e.getCause());
		}
		if (!dataIsEmpty) {
			setItems((ObservableList<T>) data);
		}
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

	private TableColumn<T, ?> buildSearchableComboBoxColumn(String columnDisplayName, Field field) {
		TableColumn<T, T> column = new TableColumn<>(columnDisplayName);
		column.setCellValueFactory(new PropertyValueFactory<>(field.getName()));

		column.setCellFactory(col -> {
			SearchableComboBoxWithErrorLabel<T> comboBox = new SearchableComboBoxWithErrorLabel<>();

			TableViewInfo tableViewInfo = field.getAnnotation(TableViewInfo.class);
			if (tableViewInfo != null && tableViewInfo.searchServiceClass() != Void.class) {
				Class<?> serviceClass = tableViewInfo.searchServiceClass();
				try {
					Object service = applicationContext.getBean(serviceClass);
					if (service instanceof AccountCodeChartService) {
						comboBox.setMinSearchCharCount(MIN_ACCOUNT_CODE_SEARCH_SYMBOL_COUNT);
						comboBox.setDataFetchService((DataFetchService<T>) service);
						comboBox.setConverter((StringConverter<T>) new AccountCodeChartStringConverter((AccountCodeChartService) service));
					}
				} catch (Exception e) {
					e.printStackTrace();
				}
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

			comboBox.valueProperty().addListener((obs, oldVal, newVal) -> {
				if (cell.getTableRow() != null && cell.getTableRow().getItem() != null) {
					try {
						field.setAccessible(true);
						field.set(cell.getTableRow().getItem(), newVal);
					} catch (IllegalAccessException e) {
						e.printStackTrace();
					}
				}
			});

			comboBox.setOnAction(event -> {
				if (cell.getTableRow() != null && cell.getTableRow().getItem() != null) {
					try {
						field.setAccessible(true);
						field.set(cell.getTableRow().getItem(), comboBox.getValue());
					} catch (IllegalAccessException e) {
						e.printStackTrace();
					}
				}
			});

			return cell;
		});

		column.setOnEditCommit(event -> {
			T item = event.getRowValue();
			try {
				field.setAccessible(true);
				field.set(item, event.getNewValue());
			} catch (IllegalAccessException e) {
				e.printStackTrace();
			}
		});

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
		column.setStyle("-fx-alignment: CENTER;");
		return column;
	}

	private <T, S> TableColumn<T, S> createColumn(String propertyName, Field field) {
		TableColumn<T, S> column = new TableColumn<>(propertyName);
		column.setCellValueFactory(param -> {
			field.setAccessible(true);
			return (ObservableValue<S>) new PropertyValueFactory<T, S>(field.getName());
		});
		column.setCellFactory(TextFieldTableCell.forTableColumn(new StringConverter<>() {
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
					e.printStackTrace();
					return null;
				}
			}
		}));
		column.setOnEditCommit(event -> {
			T item = event.getRowValue();
			try {
				field.setAccessible(true);
				field.set(item, event.getNewValue());
			} catch (IllegalAccessException e) {
				e.printStackTrace();
			}
		});
		return column;
	}

	private TableColumn<T, Void> createMenuButtonColumn(List<Pair<String, Consumer<T>>> actions) {
		TableColumn<T, Void> btnCol = new TableColumn<>();
		btnCol.setCellFactory(param -> {
			return new TableCell<>() {
				private final MenuButton menuButton = new MenuButton();

				{
					FontIcon icon = new FontIcon(MaterialDesign.MDI_MENU);
					icon.setIconSize(20);
					menuButton.setGraphic(icon);

					actions.forEach(action -> {
						MenuItem menuItem = new MenuItem(action.getKey());
						menuItem.setOnAction(event -> {
							T item = getTableView().getItems().get(getIndex());
							action.getValue().accept(item);
						});
						menuButton.getItems().add(menuItem);
					});
				}

				@Override
				protected void updateItem(Void item, boolean empty) {
					super.updateItem(item, empty);
					if (empty) {
						setGraphic(null);
					} else {
						setGraphic(menuButton);
					}
				}
			};
		});
		return btnCol;
	}
}