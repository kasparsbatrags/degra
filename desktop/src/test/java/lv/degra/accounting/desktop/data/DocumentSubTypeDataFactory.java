package lv.degra.accounting.desktop.data;

import java.util.ArrayList;
import java.util.List;

import lv.degra.accounting.core.document.model.DocumentDirection;
import lv.degra.accounting.core.document.model.DocumentSubType;
import lv.degra.accounting.core.document.model.DocumentType;

public class DocumentSubTypeDataFactory {

	public static DocumentSubType createDocumentSubType(Integer id, String title, String name, String code, DocumentType documentType,
			DocumentDirection documentDirection) {
		DocumentSubType documentSubType = new DocumentSubType();
		documentSubType.setId(id);
		documentSubType.setTitle(title);
		documentSubType.setName(name);
		documentSubType.setCode(code);
		documentSubType.setDocumentType(documentType);
		documentSubType.setDirection(documentDirection);
		return documentSubType;
	}

	public static List<DocumentSubType> getDocumentSubTypeList() {
		DocumentType documentType = DocumentTypeDataFactory.createDocumentType(1, "Invoice", "Invoice", "INV");
		DocumentDirection documentDirection = DocumentDirectionDataFactory.createDocumentDirection(1, "Inbound");
		List<DocumentSubType> subTypeList = new ArrayList<>();
		subTypeList.add(createDocumentSubType(1, "Invoice SubType", "InvoiceSub", "INV_SUB", documentType, documentDirection));
		return subTypeList;
	}

	public static DocumentSubType getGbsDocumentSubType(){
		DocumentType documentType = DocumentTypeDataFactory.createDocumentType(1, "Grāmatojums", "Grāmatojums", "ENTRY");
		DocumentDirection documentDirection = DocumentDirectionDataFactory.createDocumentDirection(3, "Iekšējais");
		return createDocumentSubType(1, "Gada saldo", "Gada bilances saldo", "GBS", documentType, documentDirection);
	}

}
