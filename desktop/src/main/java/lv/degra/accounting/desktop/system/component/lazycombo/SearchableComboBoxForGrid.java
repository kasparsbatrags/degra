package lv.degra.accounting.desktop.system.component.lazycombo;

import javafx.application.Platform;
import javafx.event.ActionEvent;
import javafx.scene.Node;
import javafx.scene.Parent;
import javafx.scene.control.TableCell;
import javafx.scene.control.TableColumn;
import javafx.scene.control.TablePosition;
import javafx.scene.control.TableView;
import javafx.scene.input.KeyCode;
import javafx.scene.input.KeyEvent;

public class SearchableComboBoxForGrid<T> extends SearchableComboBoxWithErrorLabel<T> {

	public SearchableComboBoxForGrid() {
		super();
		this.getEditor().addEventHandler(KeyEvent.KEY_PRESSED, this::handleKeyPress);
	}

	@Override
	protected void handleKeyPress(KeyEvent event) {
		if (event.getCode() == KeyCode.ESCAPE) {
			System.out.println("=================handleKeyPressed consume KeyCode.ESCAPE");
			event.consume();
		} else if (event.isShiftDown() && event.getCode() == KeyCode.TAB) {
			handleShiftTab(event);
		} else if (event.getCode() == KeyCode.ENTER || (event.getCode() == KeyCode.TAB && !event.isShiftDown())) {
			System.out.println("=================handleKeyPressed consume // Default logic");
			handleEnterOrTab();
			TableView<?> tableView = null;
			TableCell<?, ?> currentCell = findParentTableCell(this);

			if (currentCell != null) {
				tableView = currentCell.getTableView();
				if (tableView != null) {
					TablePosition focusedCell = tableView.getFocusModel().getFocusedCell();
					if (focusedCell.getColumn() == tableView.getColumns().size() - 1) {
						tableView.edit(focusedCell.getRow(), focusedCell.getTableColumn());
						event.consume();
					}
				}
			}

		} else {
			super.handleKeyPress(event);
		}
	}

	private void handleEnterOrTab() {
		if (this.isShowing() || this.getItems().size() == 1) {
			T selectedItem = getSelectionModel().getSelectedItem();
			if (selectedItem == null) {
				selectedItem = this.getItems().stream().findFirst().orElse(null);
			}
			if (selectedItem != null && this.getItems().size() == 1) {
				this.setValue(this.getItems().getFirst());
				this.hide();
				this.fireEvent(new ActionEvent());
			} else {
				this.show();
			}
		}
	}

	private void handleShiftTab(KeyEvent event) {
		TableCell<?, ?> currentCell = findParentTableCell(this);
		if (currentCell != null) {
			TableView<?> tableView = currentCell.getTableView();
			int currentColumnIndex = tableView.getColumns().indexOf(currentCell.getTableColumn());
			int currentRowIndex = currentCell.getIndex();

			// Find the previous editable column with SearchableComboBoxForGrid
			TableColumn<?, ?> previousColumn = findPreviousEditableColumn(tableView, currentColumnIndex);

			if (previousColumn != null) {
				event.consume();

				// Schedule the focus change for the next pulse
				Platform.runLater(() -> {
					// Focus the table first
					tableView.requestFocus();

					// Select the cell
					@SuppressWarnings("unchecked")
					TablePosition<Object, Object> newPosition = new TablePosition(tableView, currentRowIndex, previousColumn);
					tableView.getSelectionModel().select(currentRowIndex);
					tableView.getFocusModel().focus(newPosition);

					// Find and focus the ComboBox in the target cell
					Node targetCell = findCellAtPosition(tableView, currentRowIndex, previousColumn);
					if (targetCell instanceof Parent) {
						Node comboBox = findSearchableComboBoxInCell((Parent) targetCell);
						if (comboBox != null) {
							comboBox.requestFocus();
						}
					}
				});
			}
		}
	}

	private TableCell<?, ?> findParentTableCell(Node node) {
		Parent parent = node.getParent();
		while (parent != null && !(parent instanceof TableCell)) {
			parent = parent.getParent();
		}
		return (TableCell<?, ?>) parent;
	}

	private TableColumn<?, ?> findPreviousEditableColumn(TableView<?> tableView, int currentIndex) {
		for (int i = currentIndex - 1; i >= 0; i--) {
			TableColumn<?, ?> column = tableView.getColumns().get(i);
			if (column.isEditable() && isSearchableComboBoxColumn(column)) {
				return column;
			}
		}
		return null;
	}

	private boolean isSearchableComboBoxColumn(TableColumn<?, ?> column) {
		TableView<?> tableView = column.getTableView();
		if (tableView != null && !tableView.getItems().isEmpty()) {
			Node cell = findCellAtPosition(tableView, 0, column);
			if (cell instanceof Parent) {
				return findSearchableComboBoxInCell((Parent) cell) != null;
			}
		}
		return false;
	}

	private Node findCellAtPosition(TableView<?> tableView, int rowIndex, TableColumn<?, ?> column) {
		return tableView.lookupAll(".table-cell").stream()
				.filter(node -> node instanceof TableCell && ((TableCell<?, ?>) node).getTableColumn() == column
						&& ((TableCell<?, ?>) node).getIndex() == rowIndex).findFirst().orElse(null);
	}

	private Node findSearchableComboBoxInCell(Parent cell) {
		return cell.getChildrenUnmodifiable().stream().filter(node -> node instanceof SearchableComboBoxForGrid).findFirst().orElse(null);
	}
}