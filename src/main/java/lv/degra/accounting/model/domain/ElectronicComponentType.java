package lv.degra.accounting.model.domain;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ElectronicComponentType {
    RESISTOR(ElectronicUnit.OHM),
    CAPACITOR(ElectronicUnit.FARAD),
    INDUCTOR(ElectronicUnit.HENRY);

    private final ElectronicUnit unit;
}
