package lv.degra.accounting;

import javafx.application.HostServices;
import javafx.fxml.FXML;
import javafx.scene.control.Label;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;


@Component
public class HelloController {


    @Autowired
    private final HostServices hostServices;

    @FXML
    private Label welcomeText;

    public HelloController(HostServices hostServices) {
        this.hostServices = hostServices;
    }

    @FXML
    protected void onHelloButtonClick() {
        welcomeText.setText("Welcome to JavaFX Application!");
    }
}