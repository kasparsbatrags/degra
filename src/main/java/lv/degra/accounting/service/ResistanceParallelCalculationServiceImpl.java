package lv.degra.accounting.service;

import javafx.scene.Node;
import javafx.scene.control.TextField;
import lv.degra.accounting.model.domain.CalculationMode;
import lv.degra.accounting.model.domain.ElectronicCalculation;
import lv.degra.accounting.model.domain.ElectronicComponent;
import lv.degra.accounting.model.domain.ElectronicComponentType;
import lv.degra.accounting.model.repository.ElectronicCalculationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import static lv.degra.accounting.assembler.ResistanceInputElement.RESIS_SELECTOR;

@Service
public class ResistanceParallelCalculationServiceImpl implements ResistanceParallelCalculationService {

    @Autowired
    private ElectronicCalculationRepository repository;

    @Autowired
    private ResistorComponentService resistorComponentService;

    @Override
    public void register(Node refNode, Node resultNode) {

        Set<Node> rs = refNode.lookupAll(RESIS_SELECTOR);

        ElectronicCalculation electronicCalculation = new ElectronicCalculation();

        ElectronicComponent resultComponent = resistorComponentService.save(resultNode);
        electronicCalculation.setResult(resultComponent);
        List<ElectronicComponent> resistors = rs
                .stream()
                .filter(n -> n instanceof TextField)
                .map(n -> resistorComponentService.save(n))
                .collect(Collectors.toList());

        electronicCalculation.setComponents(resistors);
        electronicCalculation.setMode(CalculationMode.PARALLEL);
        electronicCalculation.setType(ElectronicComponentType.RESISTOR);

        repository.save(electronicCalculation);
    }
}
