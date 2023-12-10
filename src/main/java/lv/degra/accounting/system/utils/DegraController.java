package lv.degra.accounting.system.utils;

import static lv.degra.accounting.configuration.DegraConfig.DELETE_QUESTION_CONTEXT_TEXT;
import static lv.degra.accounting.configuration.DegraConfig.DELETE_QUESTION_HEADER_TEXT;

import org.springframework.stereotype.Controller;

import javafx.fxml.FXML;
import javafx.scene.control.Button;
import javafx.scene.input.KeyCode;
import javafx.scene.input.KeyEvent;
import javafx.stage.Stage;
import lv.degra.accounting.system.alert.AlertAsk;
import lv.degra.accounting.system.alert.AlertResponseType;

@Controller
public class DegraController {

	@FXML
	private Button closeButton;

	@FXML
	public void onCloseButton() {
		closeWindows();
	}

	@FXML
	public void onKeyPressEscapeAction(KeyEvent keyEvent) {
		KeyCode key = keyEvent.getCode();
		if (key == KeyCode.ESCAPE) {
			closeWindows();
		}
	}

	public void closeWindows() {
		Stage stage = (Stage) closeButton.getScene().getWindow();
		stage.close();
	}

	public <T> T getRowFromTableView(javafx.scene.control.TableView<T> tableView) {
		return tableView.getSelectionModel().getSelectedItem();
	}

	@FXML
	public void onKeyPressAction(KeyEvent keyEvent) {
		KeyCode key = keyEvent.getCode();
		if (key == KeyCode.INSERT) {
			addRecord();
		} else if (key == KeyCode.ENTER) {
			editRecord();
		} else if (key == KeyCode.DELETE) {
			if (AlertResponseType.NO.equals(new AlertAsk(DELETE_QUESTION_HEADER_TEXT, DELETE_QUESTION_CONTEXT_TEXT).getAnswer())) {
				return;
			}
			deleteRecord();
		} else if (key == KeyCode.ESCAPE) {
			closeWindows();
		}
	}

	protected void addRecord() {

	}

	protected void editRecord() {
	}

	protected void deleteRecord() {
	}
}
