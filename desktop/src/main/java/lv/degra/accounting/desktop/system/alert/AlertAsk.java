package lv.degra.accounting.desktop.system.alert;

import javafx.scene.control.Alert;
import javafx.scene.control.ButtonType;
import javafx.scene.image.Image;
import javafx.stage.Stage;
import lombok.Getter;
import lv.degra.accounting.desktop.DesktopApplication;

import java.io.InputStream;
import java.util.Optional;

import static lv.degra.accounting.desktop.system.configuration.DegraDesktopConfig.APPLICATION_ICON_FILE;
import static lv.degra.accounting.desktop.system.configuration.DegraDesktopConfig.APPLICATION_TITLE;
import static lv.degra.accounting.desktop.system.alert.AlertResponseType.NO;
import static lv.degra.accounting.desktop.system.alert.AlertResponseType.YES;

@Getter
public class AlertAsk extends Alert {
    AlertResponseType responseType;

    public AlertAsk(String headerText, String contentText) {
        super(AlertType.CONFIRMATION);
        setTitle(APPLICATION_TITLE);
        setHeaderText(headerText);
        setContentText(contentText);
        addDialogIconTo();
        Optional<ButtonType> result = showAndWait();
        if (result.isPresent() && result.get() == ButtonType.OK) {
            responseType = YES;
        } else {
            responseType = NO;
        }
    }

    public AlertResponseType getAnswer() {
        return responseType;
    }


    private void addDialogIconTo() {
        InputStream iconStream = DesktopApplication.class.getResourceAsStream(APPLICATION_ICON_FILE);
        Stage dialogStage = (Stage) this.getDialogPane().getScene().getWindow();
        if (iconStream != null) {
            dialogStage.getIcons().add(new Image(iconStream));
        }
    }

}
