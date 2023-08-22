package lv.degra.accounting;

import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.geometry.Rectangle2D;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.image.Image;
import javafx.stage.Screen;
import javafx.stage.Stage;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;

import java.io.InputStream;


@SpringBootApplication
public class DegraApplication extends Application {

    private static final String MAIN = "/system/main.fxml";
    private static final String STYLE = "/style.css";
    private static final String applicationTitle = "DeGra v1.0";

    private ConfigurableApplicationContext context;
    private Parent rootNode;

    public static void main(final String[] args) {
        Application.launch(args);
    }

    @Override
    public void init() throws Exception {
        context =  SpringApplication.run(DegraApplication.class);
        FXMLLoader fxmlLoader = new FXMLLoader(getClass().getResource(MAIN));
        fxmlLoader.setControllerFactory(context::getBean);
        rootNode = fxmlLoader.load();
    }

    @Override
    public void start(Stage primaryStage) {
         InputStream degraIconStream = DegraApplication.class.getResourceAsStream("/image/degra.png");
        Rectangle2D visualBounds = Screen.getPrimary().getVisualBounds();

//        Scene scene = getScene(primaryStage, applicationTitle);

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
        primaryStage.setTitle(applicationTitle);


        primaryStage.show();
        primaryStage.centerOnScreen();
    }


    @Override
    public void stop() {
        context.close();
    }



//    public Scene getNewScene(Stage stage, String title){
//        return
//    }


//    public Scene getScene(Stage stage, String title, String resource) throws Exception {
//
//        Parent root = FXMLLoader.load(getClass().getResource("document/Document.xml"));
//        InputStream degraIconStream = DegraApplication.class.getResourceAsStream("/image/degra.png");
//        Rectangle2D visualBounds = Screen.getPrimary().getVisualBounds();
//        Scene scene = new Scene(root, visualBounds.getWidth(), visualBounds.getHeight());
//        stage.setScene(scene);
//        scene.getStylesheets().add(getClass().getResource(STYLE).toExternalForm());
//        if (degraIconStream != null) {
//            stage.getIcons().add(new Image(degraIconStream));
//        }
//        stage.setWidth(1366);
//        stage.setHeight(768);
//        stage.setMinWidth(1366);
//        stage.setMinHeight(768);
//        stage.setTitle(title);
//        return scene;
//    }

}