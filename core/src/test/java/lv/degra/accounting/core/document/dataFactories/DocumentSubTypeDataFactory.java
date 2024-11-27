package lv.degra.accounting.core.document.dataFactories;

import static lv.degra.accounting.core.document.dataFactories.DocumentDirectionDataFactory.INBOUND_ID;
import static lv.degra.accounting.core.document.dataFactories.DocumentDirectionDataFactory.INBOUND_NAME;
import static lv.degra.accounting.core.document.dataFactories.DocumentDirectionDataFactory.createDocumentDirection;

import java.util.ArrayList;
import java.util.List;

import lv.degra.accounting.core.document.model.DocumentDirection;
import lv.degra.accounting.core.document.model.DocumentSubType;
import lv.degra.accounting.core.document.model.DocumentType;

public class DocumentSubTypeDataFactory {

	public static DocumentSubType createValidDocumentSubType() {
		DocumentSubType subType = new DocumentSubType();
		subType.setId(1);
		subType.setTitle("Invoice");
		subType.setName("Customer Invoice");
		subType.setCode("INV");
		subType.setDocumentType(DocumentTypeDataFactory.createValidDocumentType());
		subType.setDirection(createDocumentDirection(INBOUND_ID, INBOUND_NAME));
		return subType;
	}

	public static DocumentSubType getGbsDocumentSubType() {
		DocumentType documentType = DocumentTypeDataFactory.createDocumentTypeEntry();
		DocumentDirection documentDirection = DocumentDirectionDataFactory.createDocumentDirection(3, "Iekšējais");
		DocumentSubType documentSubType = createValidDocumentSubType();
		documentSubType.setTitle("Gada saldo");
		documentSubType.setName("Gada bilances saldo");
		documentSubType.setCode("GBS");
		documentSubType.setDocumentType(documentType);
		documentSubType.setDirection(documentDirection);
		return documentSubType;
	}

	public static DocumentSubType getInboundBillDocumentSubType() {
		DocumentType documentType = DocumentTypeDataFactory.createDocumentTypeBill();
		DocumentDirection documentDirection = DocumentDirectionDataFactory.createDocumentDirection(1, "Ienākošais");
		DocumentSubType documentSubType = createValidDocumentSubType();
		documentSubType.setId(2);
		documentSubType.setTitle("Rēķins ienākošais");
		documentSubType.setName("Ienākošais rēķins par pakalpojumu");
		documentSubType.setCode("BILL");
		documentSubType.setDocumentType(documentType);
		documentSubType.setDirection(documentDirection);
		return documentSubType;
	}


	public static List<DocumentSubType> getDocumentSubTypeList() {
		DocumentType documentType = DocumentTypeDataFactory.createDocumentTypeBill();
		DocumentDirection documentDirection = DocumentDirectionDataFactory.createDocumentDirection(1, "Ienākošais");
		List<DocumentSubType> subTypeList = new ArrayList<>();
		DocumentSubType documentSubType = createValidDocumentSubType();
		documentSubType.setTitle("Invoice SubType");
		documentSubType.setName("InvoiceSub");
		documentSubType.setCode("BILL");
		documentSubType.setDocumentType(documentType);
		documentSubType.setDirection(documentDirection);
		subTypeList.add(documentSubType);
		return subTypeList;
	}

	public static DocumentSubType createDocumentSubTypeWithNullTitle() {
		DocumentSubType subType = createValidDocumentSubType();
		subType.setTitle(null); // Invalid: title cannot be null
		return subType;
	}

	public static DocumentSubType createDocumentSubTypeWithLongName() {
		DocumentSubType subType = createValidDocumentSubType();
		subType.setName("This name exceeds the maximum allowed length of thirty characters");
		return subType;
	}

	public static DocumentSubType createDocumentSubTypeWithEmptyCode() {
		DocumentSubType subType = createValidDocumentSubType();
		subType.setCode(""); // Invalid: code cannot be empty
		return subType;
	}

	public static DocumentSubType createDocumentSubTypeWithCustomDirection(DocumentDirection direction) {
		DocumentSubType subType = createValidDocumentSubType();
		subType.setDirection(direction);
		return subType;
	}

	public static DocumentSubType createDocumentSubTypeWithCustomDocumentType(DocumentType documentType) {
		DocumentSubType subType = createValidDocumentSubType();
		subType.setDocumentType(documentType);
		return subType;
	}
}
