package lv.degra.accounting.desktop.data;

import lv.degra.accounting.core.document.model.DocumentType;

public class DocumentTypeDataFactory {
	public static DocumentType createDocumentType(Integer id, String title, String name, String code) {
		DocumentType documentType = new DocumentType();
		documentType.setId(id);
		documentType.setTitle(title);
		documentType.setName(name);
		documentType.setCode(code);
		return documentType;
	}
}
