package lv.degra.accounting.controller;

import javafx.fxml.FXML;
import javafx.scene.Node;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.TextField;
import javafx.scene.layout.VBox;
import lv.degra.accounting.assembler.ResistanceInputElement;
import lv.degra.accounting.service.ResistanceListResultsService;
import lv.degra.accounting.service.ResistanceParallelCalculationService;
import lv.degra.accounting.service.exception.MinimumResistancesInputReachedException;
import lv.degra.accounting.utils.ReadAndCalculateUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;

import java.util.Set;

import static lv.degra.accounting.assembler.ResistanceInputElement.RESIS_SELECTOR;

@Controller
public class MainController {

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

    @Autowired
    private ResistanceParallelCalculationService resistanceParallelCalculationService;

    @Autowired
    private ResistanceListResultsService resistanceListResultsService;

    @FXML
    public void initialize() {

        Set<Node> rs = refBox.lookupAll(RESIS_SELECTOR);

        rs.stream()
                .filter(node -> node instanceof TextField)
                .forEach(node -> node.setOnKeyReleased(event -> ReadAndCalculateUtils.asParallel(refBox, resultResistance)));

        addR.setOnMouseClicked(e -> {

            ResistanceInputElement.create(refBox, resultResistance);

            ReadAndCalculateUtils.asParallel(refBox, resultResistance);
        });

        removeR.setOnMouseClicked(event -> {

            try {
                ResistanceInputElement.remove(refBox);
            } catch (MinimumResistancesInputReachedException e) {
                e.printStackTrace();
            }

            ReadAndCalculateUtils.asParallel(refBox, resultResistance);

        });

        saveR.setOnMouseClicked(event -> {
            resistanceParallelCalculationService.register(refBox, resultResistance);
            resistanceListResultsService.update(historyCalculation);
        });

        resistanceListResultsService.update(historyCalculation);
    }
}
