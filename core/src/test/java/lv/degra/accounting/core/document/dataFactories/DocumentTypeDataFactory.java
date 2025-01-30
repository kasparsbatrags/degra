package lv.degra.accounting.core.document.dataFactories;

import jakarta.validation.constraints.Size;
import lv.degra.accounting.core.document.model.DocumentType;

public class DocumentTypeDataFactory {

	private static final String ENTRY = "ENTRY";
	private static final String ENTRY_TITLE = "Grāmatojums";
	private static final @Size(max = 10) String BILL = "BILL";
	private static final @Size(max = 30) String BILL_TITLE = "Rēķins";

	public static DocumentType createValidDocumentType() {
		DocumentType documentType = new DocumentType();
		documentType.setId(1);
		documentType.setTitle("Invoice");
		documentType.setName("Customer Invoice");
		documentType.setCode("INV");
		return documentType;
	}


	public static DocumentType createDocumentTypeEntry() {
		DocumentType documentType = createValidDocumentType();
		documentType.setCode(ENTRY);
		documentType.setTitle(ENTRY_TITLE);
		documentType.setName(ENTRY_TITLE);
		return documentType;
	}

	public static DocumentType createDocumentTypeBill() {
		DocumentType documentType = createValidDocumentType();
		documentType.setCode(BILL);
		documentType.setTitle(BILL_TITLE);
		documentType.setName(BILL_TITLE);
		return documentType;
	}


	public static DocumentType createDocumentTypeWithNullTitle() {
		DocumentType documentType = createValidDocumentType();
		documentType.setTitle(null); // Invalid: title cannot be null
		return documentType;
	}

	public static DocumentType createDocumentTypeWithLongName() {
		DocumentType documentType = createValidDocumentType();
		documentType.setName("This name exceeds the maximum allowed length of thirty characters");
		return documentType;
	}

	public static DocumentType createDocumentTypeWithEmptyCode() {
		DocumentType documentType = createValidDocumentType();
		documentType.setCode(""); // Invalid: code cannot be empty
		return documentType;
	}

	public static DocumentType createDocumentTypeWithDifferentId(Integer id) {
		DocumentType documentType = createValidDocumentType();
		documentType.setId(id); // Assign a custom ID for testing
		return documentType;
	}
}
