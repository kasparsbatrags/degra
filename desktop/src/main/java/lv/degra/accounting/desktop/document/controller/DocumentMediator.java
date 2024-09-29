package lv.degra.accounting.desktop.document.controller;

import lv.degra.accounting.core.document.dto.DocumentDto;
import lv.degra.accounting.core.document.model.DocumentSubType;

public class DocumentMediator {
	private DocumentInfoController documentInfoController;
	private BillController billController;
	private DocumentAdditionalInfoController additionalInfoController;

	public void setDocumentInfoController(DocumentInfoController controller) {
		this.documentInfoController = controller;
	}

	public void setBillController(BillController controller) {
		this.billController = controller;
	}

	public void setAdditionalInfoController(DocumentAdditionalInfoController controller) {
		this.additionalInfoController = controller;
	}

	public void documentTypeChanged(DocumentSubType newType) {
		billController.updateVisibility(newType);
		additionalInfoController.updateFields(newType);
	}

	public void billTotalChanged(double newTotal) {
		documentInfoController.updateTotalSum(newTotal);
	}

	public void saveDocument() {
		DocumentDto dto = documentInfoController.getDocumentDto();
		dto.setBillContent(billController.getBillContent());
		dto.setAdditionalInfo(additionalInfoController.getAdditionalInfo());
		// Saglabā dokumentu
	}


}