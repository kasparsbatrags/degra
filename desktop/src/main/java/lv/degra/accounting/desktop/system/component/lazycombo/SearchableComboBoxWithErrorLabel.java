package lv.degra.accounting.desktop.system.component.lazycombo;

import org.springframework.stereotype.Component;

import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.event.ActionEvent;
import javafx.scene.input.KeyCode;
import javafx.scene.input.KeyEvent;
import lombok.Getter;
import lombok.Setter;
import lv.degra.accounting.core.system.DataFetchService;

@Component
public class SearchableComboBoxWithErrorLabel<T> extends ComboBoxWithErrorLabel<T> {

	@Setter
	@Getter
	private int minSearchCharCount = 3;
	private boolean blockAutoLoadData = false;
	private DataFetchService<T> dataFetchService;

	public SearchableComboBoxWithErrorLabel() {
		super();
		setupSearchListener();
	}

	public void setDataFetchService(DataFetchService<T> customerService) {
		this.dataFetchService = customerService;
	}

	private void setupSearchListener() {
		this.setEditable(true);
		String searchPlaceholderText = "Meklēt... (vismaz " + getMinSearchCharCount() + " simboli)";
		this.setPromptText(searchPlaceholderText);

		this.valueProperty().addListener((obs, oldVal, newVal) -> blockAutoLoadData = newVal != null);

		this.getEditor().textProperty().addListener((observable, oldValue, newValue) -> {
			if (!blockAutoLoadData && newValue.length() >= minSearchCharCount) {
				loadData(newValue);
			}
			blockAutoLoadData = false;
		});

		this.getEditor().addEventHandler(KeyEvent.KEY_PRESSED, this::handleKeyPressed);
	}

	private void handleKeyPressed(KeyEvent event) {
		if (event.getCode() == KeyCode.ENTER || event.getCode() == KeyCode.TAB) {
			handleEnterOrTab();
		} else if (event.getCode() == KeyCode.BACK_SPACE) {
			handleBackspace();
			event.consume();
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

	private void handleBackspace() {
		String text = this.getEditor().getText();
		int caretPosition = this.getEditor().getCaretPosition();

		if (caretPosition > 0 && !text.isEmpty()) {
			String newText = text.substring(0, caretPosition - 1) + text.substring(caretPosition);
			this.getEditor().setText(newText);
			this.getEditor().positionCaret(caretPosition - 1);
		}
	}

	private void loadData(String searchText) {
		if (dataFetchService != null) {
			this.setItems(fetchDataFromService(searchText));
			this.show();
		}
	}

	private ObservableList<T> fetchDataFromService(String searchText) {
		return FXCollections.observableArrayList(dataFetchService.getSuggestions(searchText));
	}

}
