package lv.degra.accounting.core.document.dataFactories;

import lv.degra.accounting.core.document.model.DeclarationSection;
import lv.degra.accounting.core.document.model.DocumentTransactionType;

public class DocumentTransactionTypeDataFactory {

	public static DocumentTransactionType createValidTransactionType() {
		DocumentTransactionType transactionType = new DocumentTransactionType();
		transactionType.setId(1);
		transactionType.setCode("TT"); // Valid 2-character code
		transactionType.setName("Transaction Type Name"); // Valid 100-character max
		transactionType.setDeclarationSection(createValidDeclarationSection());
		return transactionType;
	}

	public static DocumentTransactionType createTransactionTypeWithLongCode() {
		DocumentTransactionType transactionType = createValidTransactionType();
		transactionType.setCode("TOOLONG"); // Invalid, exceeds 2 characters
		return transactionType;
	}

	public static DocumentTransactionType createTransactionTypeWithNullName() {
		DocumentTransactionType transactionType = createValidTransactionType();
		transactionType.setName(null); // Invalid, name cannot be null
		return transactionType;
	}

	public static DocumentTransactionType createTransactionTypeWithNullDeclarationSection() {
		DocumentTransactionType transactionType = createValidTransactionType();
		transactionType.setDeclarationSection(null); // Invalid, declaration section cannot be null
		return transactionType;
	}

	private static DeclarationSection createValidDeclarationSection() {
		DeclarationSection section = new DeclarationSection();
		section.setId(1);
		section.setName("Valid Section");
		return section;
	}
}
