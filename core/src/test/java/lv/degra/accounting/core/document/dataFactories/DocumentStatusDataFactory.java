package lv.degra.accounting.core.document.dataFactories;

import lv.degra.accounting.core.document.model.DocumentStatus;

public class DocumentStatusDataFactory {

	public static DocumentStatus createNewStatus() {
		DocumentStatus status = new DocumentStatus();
		status.setId(1);
		status.setCode("J");
		status.setName("Jauns");
		return status;
	}

	public static DocumentStatus createApprovedStatus() {
		DocumentStatus status = new DocumentStatus();
		status.setId(2);
		status.setCode("A");
		status.setName("Apstiprināts");
		return status;
	}

	public static DocumentStatus createStatusWithInvalidCode() {
		DocumentStatus status = createNewStatus();
		status.setCode("INVALID_CODE"); // Pārsniedz 10 simbolus
		return status;
	}

	public static DocumentStatus createStatusWithNullName() {
		DocumentStatus status = createApprovedStatus();
		status.setName(null); // Invalid, jo name nedrīkst būt null
		return status;
	}

	public static DocumentStatus createStatusWithNullCode() {
		DocumentStatus status = createApprovedStatus();
		status.setCode(null); // Invalid, jo code nedrīkst būt null
		return status;
	}

}
