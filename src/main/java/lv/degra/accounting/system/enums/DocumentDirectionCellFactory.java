package lv.degra.accounting.system.enums;

import javax.swing.text.Document;

import lv.degra.accounting.document.enums.DocumentDirection;

public class DocumentDirectionCellFactory extends EnumNameCellFactory<Document, DocumentDirection> {
	@Override
	protected String getEnumDisplayName(DocumentDirection documentDirection) {
		return documentDirection.getDisplayName();
	}
}