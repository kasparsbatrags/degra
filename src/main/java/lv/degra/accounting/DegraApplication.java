package lv.degra.accounting;

import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.geometry.Rectangle2D;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.image.Image;
import javafx.stage.Screen;
import javafx.stage.Stage;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.context.ConfigurableApplicationContext;

import java.io.InputStream;

import static lv.degra.accounting.configuration.DegraConfig.*;


@SpringBootApplication
public class DegraApplication extends Application {


    private ConfigurableApplicationContext context;
    private Parent rootNode;

    @Override
    public void init() throws Exception {
        SpringApplicationBuilder builder = new SpringApplicationBuilder(DegraApplication.class);
        context = builder.run(getParameters().getRaw().toArray(new String[0]));
        builder.headless(false);
        FXMLLoader fxmlLoader = new FXMLLoader(getClass().getResource(MAIN));
        fxmlLoader.setControllerFactory(context::getBean);
        rootNode = fxmlLoader.load();
    }

    @Override
    public void start(Stage primaryStage)  {
        InputStream degraIconStream = DegraApplication.class.getResourceAsStream("/image/degra.png");
        Rectangle2D visualBounds = Screen.getPrimary().getVisualBounds();

        Scene scene = new Scene(rootNode, visualBounds.getWidth(), visualBounds.getHeight());

        primaryStage.setScene(scene);

        scene.getStylesheets().add(getClass().getResource(STYLE).toExternalForm());
        if (degraIconStream != null) {
            primaryStage.getIcons().add(new Image(degraIconStream));
        }
        primaryStage.setWidth(1366);
        primaryStage.setHeight(768);

        primaryStage.setMinWidth(1366);
        primaryStage.setMinHeight(768);
        primaryStage.setTitle(APPLICATION_TITLE);


        primaryStage.show();
        primaryStage.centerOnScreen();
    }


    @Override
    public void stop() {
        context.close();
    }


}