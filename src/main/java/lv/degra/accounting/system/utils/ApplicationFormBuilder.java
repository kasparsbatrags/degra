package lv.degra.accounting.system.utils;

import static lv.degra.accounting.system.configuration.DegraConfig.APPLICATION_ICON_FILE;
import static lv.degra.accounting.system.configuration.DegraConfig.APPLICATION_TITLE;
import static lv.degra.accounting.system.configuration.DegraConfig.STYLE;

import java.io.IOException;
import java.io.InputStream;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

import javafx.fxml.FXMLLoader;
import javafx.geometry.Rectangle2D;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.image.Image;
import javafx.stage.Screen;
import javafx.stage.Stage;
import lv.degra.accounting.DegraApplication;
import lv.degra.accounting.system.exception.DegraRuntimeException;
import lv.degra.accounting.system.exception.FxmlFileLoaderException;

@Component
public class ApplicationFormBuilder {

	@Autowired
	private ApplicationContext context;

	public Parent loadFxml(String sceneFormFile) {
		FXMLLoader fxmlLoader = new FXMLLoader(getClass().getResource(sceneFormFile));
		fxmlLoader.setControllerFactory(context::getBean);
		Parent root = null;
		try {
			root = fxmlLoader.load();
		} catch (FxmlFileLoaderException ex) {
			Throwable rootCause = ex.getCause();
			if (rootCause != null) {
				rootCause.printStackTrace();
			} else {
				ex.printStackTrace();
			}
		} catch (IOException e) {
			throw new DegraRuntimeException(e.getMessage(), e);
		}
		return root;
	}

	public void buildScene(String sceneFormFile, String additionalTitle) throws IOException {
		FXMLLoader fxmlLoader = new FXMLLoader(getClass().getResource(sceneFormFile));
		fxmlLoader.setControllerFactory(context::getBean);
		Parent root = fxmlLoader.load();
		Stage stage = getApplicationFormatedStage(root, additionalTitle);
		stage.showAndWait();
	}

	public Stage getApplicationFormatedStage(Parent root, String additionalTitle) {
		Stage stage = new Stage();
		Rectangle2D visualBounds = Screen.getPrimary().getVisualBounds();
		Scene scene = new Scene(root, visualBounds.getWidth(), visualBounds.getHeight());
		scene.getStylesheets().add(getClass().getResource(STYLE).toExternalForm());
		InputStream mainIconStream = DegraApplication.class.getResourceAsStream(APPLICATION_ICON_FILE);
		if (mainIconStream != null) {
			stage.getIcons().add(new Image(mainIconStream));
		}
		stage.setTitle(APPLICATION_TITLE + " - " + additionalTitle);
		stage.setScene(scene);
		stage.setMinWidth(1366);
		stage.setMinHeight(768);
		return stage;

	}
}
