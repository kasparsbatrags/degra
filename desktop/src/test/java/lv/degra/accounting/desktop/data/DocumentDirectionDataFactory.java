package lv.degra.accounting.desktop.data;

import java.util.ArrayList;
import java.util.List;

import lv.degra.accounting.core.document.model.DocumentDirection;

public class DocumentDirectionDataFactory {

	public static Integer INBOUND_ID = 1;
	public static String INBOUND_NAME = "Ienākošais";
	public static Integer OUTBOUND_ID = 2;
	public static String OUTBOUND_NAME = "Izejošais";
	public static Integer INTERNAL_ID = 3;
	public static String INTERNAL_NAME = "Iekšējais";

	public static DocumentDirection createDocumentDirection(Integer id, String name) {
		DocumentDirection documentDirection = new DocumentDirection();
		documentDirection.setId(id);
		documentDirection.setName(name);
		return documentDirection;
	}


	public static List<DocumentDirection> getDocumentDirectionList(){
		List<DocumentDirection> documentDirections = new ArrayList<>();
		documentDirections.add(createDocumentDirection(INBOUND_ID, INBOUND_NAME));
		return documentDirections;
	}



}
