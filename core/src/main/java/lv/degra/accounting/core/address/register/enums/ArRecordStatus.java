package lv.degra.accounting.core.address.register.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Arrays;

@Getter
@AllArgsConstructor
public enum ArRecordStatus {
    EXIST("EKS", 1),
    DELETED("DEL", 2),
    STATUS_ERROR("ERR", 3);

    private final String code;
    private final int statusOnSystem;

    public static int getStatusOnSystemByCode(String code) {
        return Arrays.stream(values())
                .filter(value -> value.code.equalsIgnoreCase(code))
                .findFirst()
                .map(value -> value.statusOnSystem)
                .orElseThrow(() -> new IllegalArgumentException("Invalid code: " + code));
    }
}
