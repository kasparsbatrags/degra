package lv.degra.accounting.document.controller;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

import lv.degra.accounting.system.exception.IncorrectSumException;

class DocumentControllerTest {

	@Test
	void testGetDouble() {
		DocumentController documentController = new DocumentController();

		String validDouble = "123.45";
		assertEquals(123.45, documentController.getDouble(validDouble));

		String invalidDouble = "abc";
		assertThrows(IncorrectSumException.class, () -> documentController.getDouble(invalidDouble));
	}
}