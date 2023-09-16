package lv.degra.accounting.system.utils;

import javafx.fxml.FXMLLoader;
import javafx.geometry.Rectangle2D;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.image.Image;
import javafx.stage.Screen;
import javafx.stage.Stage;
import lv.degra.accounting.DegraApplication;
import lv.degra.accounting.system.exception.FxmlFileLoaderException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;

import static lv.degra.accounting.configuration.DegraConfig.APPLICATION_TITLE;
import static lv.degra.accounting.configuration.DegraConfig.STYLE;

@Component
public class DegraFormBuilder {

    @Autowired
    ApplicationContext context;


    public Parent loadFxml(String sceneFormFile) {
        FXMLLoader fxmlLoader = new FXMLLoader(getClass().getResource(sceneFormFile));
        fxmlLoader.setControllerFactory(context::getBean);
        Parent root;
        try {
            root = fxmlLoader.load();
        } catch (IOException e) {
            throw new FxmlFileLoaderException(e.getMessage());
        }
        return root;
    }


    public void buildScene(String sceneFormFile, String additionalTitle) throws IOException {
        FXMLLoader fxmlLoader = new FXMLLoader(getClass().getResource(sceneFormFile));
        fxmlLoader.setControllerFactory(context::getBean);
        Parent root = fxmlLoader.load();
        Stage stage = getFormatedStage(root, additionalTitle);
        stage.showAndWait();
    }

    public Stage getFormatedStage(Parent root, String additionalTitle) {
        Stage stage = new Stage();
        Rectangle2D visualBounds = Screen.getPrimary().getVisualBounds();
        Scene scene = new Scene(root, visualBounds.getWidth(), visualBounds.getHeight());
        scene.getStylesheets().add(getClass().getResource(STYLE).toExternalForm());
        InputStream mainIconStream = DegraApplication.class.getResourceAsStream("/image/degra.png");
        if (mainIconStream != null) {
            stage.getIcons().add(new Image(mainIconStream));
        }
        stage.setTitle(APPLICATION_TITLE + " - " + additionalTitle);
        stage.setScene(scene);
        return stage;

    }
}
