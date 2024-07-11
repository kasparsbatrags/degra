package lv.degra.accounting.system.object.lazycombo;

import org.springframework.stereotype.Component;

import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.event.ActionEvent;
import javafx.scene.input.KeyCode;
import javafx.scene.input.KeyEvent;
import javafx.util.StringConverter;
import lv.degra.accounting.customer.service.CustomerService;
import lv.degra.accounting.system.object.ComboBoxWithErrorLabel;

@Component
public class SearchableComboBox<T> extends ComboBoxWithErrorLabel<T> {

	private static final int MIN_SEARCH_CHAR_COUNT = 3;
	private static final String SEARCH_PLACEHOLDER_TEXT = "Meklēt... (vismaz " + MIN_SEARCH_CHAR_COUNT + " simboli)";

	private CustomerService customerService;
	private boolean blockAutoLoadData = false;

	public SearchableComboBox() {
		super();
		setupSearchListener();
	}

	public void setCustomerService(CustomerService customerService) {
		this.customerService = customerService;
		this.setConverter((StringConverter<T>) new CustomerConverter(customerService));
	}

	private void setupSearchListener() {
		this.setEditable(true);
		this.setPromptText(SEARCH_PLACEHOLDER_TEXT);

		this.valueProperty().addListener((obs, oldVal, newVal) -> blockAutoLoadData = newVal != null);

		this.getEditor().textProperty().addListener((observable, oldValue, newValue) -> {
			if (!blockAutoLoadData && newValue.length() >= MIN_SEARCH_CHAR_COUNT) {
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
				this.setValue(this.getItems().get(0));
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
		this.setItems(fetchDataFromService(searchText));
		this.show();
	}

	private ObservableList<T> fetchDataFromService(String searchText) {
		return (ObservableList<T>) FXCollections.observableArrayList(customerService.getTop30Suggestions(searchText));
	}
}
