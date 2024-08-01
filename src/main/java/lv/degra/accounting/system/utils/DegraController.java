package lv.degra.accounting.system.utils;

import static lv.degra.accounting.system.configuration.DegraConfig.DELETE_QUESTION_CONTEXT_TEXT;
import static lv.degra.accounting.system.configuration.DegraConfig.DELETE_QUESTION_HEADER_TEXT;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Predicate;

import javafx.fxml.FXML;
import javafx.scene.control.Button;
import javafx.scene.input.KeyCode;
import javafx.scene.input.KeyEvent;
import javafx.stage.Stage;
import lombok.Getter;
import lv.degra.accounting.system.alert.AlertAsk;
import lv.degra.accounting.system.alert.AlertResponseType;
import lv.degra.accounting.system.exception.CannotPerformException;
import lv.degra.accounting.system.object.ControlWithErrorLabel;

public class DegraController {

	@FXML
	public Button closeButton;
	@Getter
	protected List<ControlWithErrorLabel<?>> validationControls = new ArrayList<>();

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

	public <T> void addValidationControl(ControlWithErrorLabel<T> control, Predicate<T> validationCondition, String errorMessage) {
		control.setValidationCondition(validationCondition, errorMessage);
		validationControls.add(control);
	}

	public void closeWindows() {
		if (closeButton != null) {
			Stage stage = (Stage) closeButton.getScene().getWindow();
			stage.close();
		}
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
				keyEvent.consume();
				return;
			}
			deleteRecord();
			keyEvent.consume();
		} else if (key == KeyCode.ESCAPE) {
			closeWindows();
		}
	}

	protected void addRecord() {
		throw new CannotPerformException("notImplemented() cannot be performed because in controller addRecord() is not Override!");
	}

	protected void editRecord() {
		throw new CannotPerformException("notImplemented() cannot be performed because in controller editRecord() is not Override!");
	}

	protected void deleteRecord() {
		throw new CannotPerformException("notImplemented() cannot be performed because in controller deleteRecord() is not Override!");
	}
}
