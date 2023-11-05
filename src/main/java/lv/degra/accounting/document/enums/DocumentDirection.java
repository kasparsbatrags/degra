package lv.degra.accounting.document.enums;

import lombok.Getter;
import lv.degra.accounting.system.exception.IllegalEnumException;

@Getter
public enum DocumentDirection {

    IN(1, "Ienākošais"), OUT(2, "Izejošais"), INTERNAL(3,"Iekšējais");

    @Getter
    private final int id;
    @Getter
    private final String displayName;

    DocumentDirection(int directionId, String displayName) {
        this.id = directionId;
        this.displayName = displayName;
    }

	public static DocumentDirection fromId(int id) {
		for (DocumentDirection documentDirection : DocumentDirection.values()) {
			if (documentDirection.getId() == id) {
				return documentDirection;
			}
		}
		throw new IllegalEnumException("Invalid DocumentDirection ID: " + id);
	}

}
