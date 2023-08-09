package lv.degra.accounting;

import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.geometry.Rectangle2D;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.image.Image;
import javafx.stage.Screen;
import javafx.stage.Stage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.context.ConfigurableApplicationContext;

import java.io.IOException;
import java.io.InputStream;


@SpringBootApplication
public class DegraApplication extends Application {

    private static String applicationTitle = "DeGra v1.0";
    private static final String MAIN = "/main.fxml";
    private static final String STYLE = "/style.css";
    private ConfigurableApplicationContext context;

    private Parent rootNode;

    @Override
    public void init() throws IOException {
        SpringApplicationBuilder builder = new SpringApplicationBuilder(DegraApplication.class);
        context = builder.run(getParameters().getRaw().toArray(new String[0]));
        builder.headless(false);
        FXMLLoader loader = new FXMLLoader(getClass().getResource(MAIN));
        loader.setControllerFactory(context::getBean);
        rootNode = loader.load();

    }

    @Override
    public void start(Stage primaryStage) {
        InputStream degraIconStream = DegraApplication.class.getResourceAsStream("/image/degra.png");
        Rectangle2D visualBounds = Screen.getPrimary().getVisualBounds();

        Scene scene = new Scene(rootNode, visualBounds.getWidth(), visualBounds.getHeight());

        primaryStage.setScene(scene);

        scene.getStylesheets().add(getClass().getResource(STYLE).toExternalForm());
        if (degraIconStream != null) {
            primaryStage.getIcons().add(new Image(degraIconStream));
        }
        primaryStage.setWidth(700);
        primaryStage.setHeight(500);

        primaryStage.setMinWidth(150);
        primaryStage.setMinHeight(200);
        primaryStage.setTitle(applicationTitle);


        primaryStage.show();
        primaryStage.centerOnScreen();
    }


    @Override
    public void stop() {
        context.close();
    }

}