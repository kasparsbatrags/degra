package lv.degra.accounting.desktop.data;

import static lv.degra.accounting.desktop.data.DocumentDirectionDataFactory.createDocumentDirection;
import static lv.degra.accounting.desktop.data.DocumentSubTypeDataFactory.createDocumentSubType;
import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

import lv.degra.accounting.core.document.model.DocumentDirection;
import lv.degra.accounting.core.document.model.DocumentSubType;
import lv.degra.accounting.core.document.model.DocumentType;

class DataFactoryTest {

	@Test
	void testCreateDocumentType() {
		DocumentType documentType = DocumentTypeDataFactory.createDocumentType(1, "Invoice", "Invoice", "INV");
		assertEquals(1, documentType.getId());
		assertEquals("Invoice", documentType.getTitle());
		assertEquals("Invoice", documentType.getName());
		assertEquals("INV", documentType.getCode());
	}

	@Test
	void testCreateDocumentDirection() {
		DocumentDirection documentDirection = createDocumentDirection(1, "Inbound");
		assertEquals(1, documentDirection.getId());
		assertEquals("Inbound", documentDirection.getName());
	}

	@Test
	void testCreateDocumentSubType() {
		DocumentType documentType = DocumentTypeDataFactory.createDocumentType(1, "Invoice", "Invoice", "INV");
		DocumentDirection documentDirection = createDocumentDirection(1, "Inbound");
		DocumentSubType documentSubType = createDocumentSubType(1, "Invoice SubType", "InvoiceSub", "INV_SUB",
				documentType, documentDirection);

		assertEquals(1, documentSubType.getId());
		assertEquals("Invoice SubType", documentSubType.getTitle());
		assertEquals("InvoiceSub", documentSubType.getName());
		assertEquals("INV_SUB", documentSubType.getCode());
		assertEquals(documentType, documentSubType.getDocumentType());
		assertEquals(documentDirection, documentSubType.getDirection());
	}
}
