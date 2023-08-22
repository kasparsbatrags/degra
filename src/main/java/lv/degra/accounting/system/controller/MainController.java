package lv.degra.accounting.system.controller;

import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.geometry.Rectangle2D;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.image.Image;
import javafx.scene.layout.VBox;
import javafx.stage.Modality;
import javafx.stage.Screen;
import javafx.stage.Stage;
import lv.degra.accounting.DegraApplication;
import org.springframework.stereotype.Controller;

import java.io.IOException;
import java.io.InputStream;

@Controller
public class MainController {

    private static final String STYLE = "/style.css";
    private static final String applicationTitle = "DeGra v1.0 ";

    @FXML
    public VBox refBox;

    @FXML
    public Label resultResistance;

    @FXML
    public Button addR;

    @FXML
    public Button removeR;

    @FXML
    public Button saveR;

    @FXML
    public VBox historyCalculation;

    public void createNewDocument(ActionEvent actionEvent) throws IOException {


        Parent root = FXMLLoader.load(getClass().getResource("/document/Document.fxml"));
        InputStream degraIconStream = DegraApplication.class.getResourceAsStream("/image/degra.png");
        Rectangle2D visualBounds = Screen.getPrimary().getVisualBounds();
        Scene scene = new Scene(root, visualBounds.getWidth(), visualBounds.getHeight());
        Stage stage = new Stage();
        stage.setScene(scene);
        scene.getStylesheets().add(getClass().getResource(STYLE).toExternalForm());
        if (degraIconStream != null) {
            stage.getIcons().add(new Image(degraIconStream));
        }
        stage.setWidth(1366);
        stage.setHeight(738);
        stage.setMinWidth(1366);
        stage.setMinHeight(728);
        stage.setTitle(applicationTitle + "Pievienot jaunu dokumentu");
        stage.initModality(Modality.APPLICATION_MODAL);
        stage.show();


//        primaryStage.setWidth(1366);
//        primaryStage.setHeight(768);
//        Parent newDocument = FXMLLoader.load(getClass().getResource("/document/Document.fxml"));
//        Scene scene = new Scene(newDocument);
    }
}
