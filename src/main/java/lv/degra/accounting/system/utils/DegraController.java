package lv.degra.accounting.system.utils;

import javafx.fxml.FXML;
import javafx.scene.control.Button;
import javafx.scene.input.KeyCode;
import javafx.scene.input.KeyEvent;
import javafx.stage.Stage;
import org.springframework.stereotype.Controller;

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


}
