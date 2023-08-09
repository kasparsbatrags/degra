package lv.degra.accounting.model.domain;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ElectronicUnit {

    OHM("Ω"), FARAD("F"), HENRY("H");

    private final String ending;


}
