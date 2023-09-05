package lv.degra.accounting.system.utils;

import javafx.fxml.FXMLLoader;
import javafx.geometry.Rectangle2D;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.image.Image;
import javafx.stage.Modality;
import javafx.stage.Screen;
import javafx.stage.Stage;
import lv.degra.accounting.DegraApplication;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;

import static lv.degra.accounting.configuration.DegraConfig.APPLICATION_TITLE;
import static lv.degra.accounting.configuration.DegraConfig.STYLE;

@Component
public class DegraFormBuilder {

    @Autowired
    ApplicationContext context;

    public void buildScene(String sceneFormFile, String additionalTitle) throws IOException {
        FXMLLoader fxmlLoader = new FXMLLoader(getClass().getResource(sceneFormFile));
        fxmlLoader.setControllerFactory(context::getBean);
        Parent root = fxmlLoader.load();
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
        stage.setTitle(APPLICATION_TITLE + additionalTitle);
        stage.initModality(Modality.APPLICATION_MODAL);
        stage.show();
    }
}
