package lv.degra.accounting.document.enums;

import java.util.Map;
import java.util.HashMap;

import lombok.Getter;
import lv.degra.accounting.system.exception.IllegalEnumException;

@Getter
public enum DocumentDirection {

	IN(1, "Ienākošais"),
	OUT(2, "Izejošais"),
	INTERNAL(3, "Iekšējais");

	private final int id;
	private final String displayName;

	private static final Map<Integer, DocumentDirection> ID_MAP = new HashMap<>();

	static {
		for (DocumentDirection direction : DocumentDirection.values()) {
			ID_MAP.put(direction.getId(), direction);
		}
	}

	DocumentDirection(int directionId, String displayName) {
		this.id = directionId;
		this.displayName = displayName;
	}

	public static DocumentDirection fromId(int id) {
		DocumentDirection direction = ID_MAP.get(id);
		if (direction == null) {
			throw new IllegalEnumException("Invalid DocumentDirection ID: " + id);
		}
		return direction;
	}
}
