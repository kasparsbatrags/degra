package lv.degra.accounting.desktop.splash;

import static lv.degra.accounting.desktop.system.configuration.DegraDesktopConfig.APPLICATION_SPLASH_FILE;
import static lv.degra.accounting.desktop.system.configuration.DegraDesktopConfig.SPLASH_SCREEN_LOADING_TEXT;

import java.io.FileNotFoundException;
import java.io.InputStream;

import javafx.animation.KeyFrame;
import javafx.animation.Timeline;
import javafx.application.Platform;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.StackPane;
import javafx.scene.layout.VBox;
import javafx.scene.text.Font;
import javafx.scene.text.Text;
import javafx.stage.Screen;
import javafx.stage.Stage;
import javafx.stage.StageStyle;
import javafx.util.Duration;
import lv.degra.accounting.desktop.DesktopApplication;
import lv.degra.accounting.desktop.system.configuration.DegraDesktopConfig;


public class SplashScreen {

	private Stage splashStage;

	public void show() {
		Platform.runLater(() -> {
			splashStage = new Stage();
			StackPane root = new StackPane();
			InputStream degraIconStream = null;
			try {
				degraIconStream = DesktopApplication.class.getResourceAsStream(DegraDesktopConfig.APPLICATION_ICON_FILE);
				InputStream inputStream = getClass().getResourceAsStream(APPLICATION_SPLASH_FILE);
				if (inputStream == null) {
					throw new FileNotFoundException("Attēls netika atrasts resursu direktorijā.");
				}
				Image splashImage = new Image(inputStream);
				ImageView imageView = new ImageView(splashImage);

				root.getChildren().add(imageView);
				StackPane.setAlignment(imageView, Pos.CENTER);


				Text loadingText = new Text(SPLASH_SCREEN_LOADING_TEXT);
				loadingText.setFont(Font.font("Arial", 16));
				loadingText.setFill(javafx.scene.paint.Color.WHITE);
				VBox textContainer = new VBox(loadingText);
				textContainer.setAlignment(Pos.BOTTOM_LEFT);
				textContainer.setTranslateY(-20);
				textContainer.setTranslateX(510);
				root.getChildren().add(textContainer);

				Timeline timeline = new Timeline(new KeyFrame(Duration.seconds(0.5), event -> {
					String text = loadingText.getText();
					if (text.endsWith("...")) {
						loadingText.setText(SPLASH_SCREEN_LOADING_TEXT);
					} else {
						loadingText.setText(text + ".");
					}
				}));
				timeline.setCycleCount(Timeline.INDEFINITE);
				timeline.play();

			} catch (Exception e) {
				root.getChildren().add(new javafx.scene.control.Label(SPLASH_SCREEN_LOADING_TEXT));
			}

			Scene scene = new Scene(root);
			splashStage.setScene(scene);
			splashStage.initStyle(StageStyle.UNDECORATED);
			if (degraIconStream != null) {
				splashStage.getIcons().add(new Image(degraIconStream));
			}

			splashStage.setWidth(600);
			splashStage.setHeight(400);
			splashStage.setX((Screen.getPrimary().getBounds().getWidth() - splashStage.getWidth()) / 2);
			splashStage.setY((Screen.getPrimary().getBounds().getHeight() - splashStage.getHeight()) / 2);

			splashStage.show();
		});
	}

	public void close() {
		Platform.runLater(() -> {
			if (splashStage != null) {
				splashStage.close();
			}
		});
	}
}
