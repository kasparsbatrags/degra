package lv.degra.accounting.desktop.system.settings.classifiers.controller;

import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.control.TreeItem;
import javafx.scene.control.TreeView;
import javafx.scene.input.ContextMenuEvent;

import java.net.URL;
import java.util.ResourceBundle;

public class ClassifiersController implements Initializable {


//    https://www.youtube.com/watch?v=CNLHTrY3Nh8&ab_channel=BroCode

    @FXML
    public TreeView classifiersTree;

    @Override
    public void initialize(URL url, ResourceBundle resourceBundle) {
        TreeItem<String> root = new TreeItem<>("Classifiers");
        classifiersTree.setRoot(root);
    }

    public void selectItem(ContextMenuEvent contextMenuEvent) {
    }


}
