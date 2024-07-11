package lv.degra.accounting.data;

import java.util.ArrayList;
import java.util.List;

import lv.degra.accounting.document.model.DocumentDirection;

public class DocumentDirectionDataFactory {

	public static DocumentDirection createDocumentDirection(Integer id, String name) {
		DocumentDirection documentDirection = new DocumentDirection();
		documentDirection.setId(id);
		documentDirection.setName(name);
		return documentDirection;
	}


	public static List<DocumentDirection> getDocumentDirectionList(){
		List<DocumentDirection> documentDirections = new ArrayList<>();
		documentDirections.add(createDocumentDirection(1, "Inbound"));
		return documentDirections;

	}

}
