package lv.degra.accounting.document.controller;

import static lv.degra.accounting.system.configuration.DegraConfig.APPLICATION_TITLE;
import static lv.degra.accounting.system.configuration.DegraConfig.VAT_PERCENTS;
import static lv.degra.accounting.document.DocumentFieldsUtils.fillCombo;
import static lv.degra.accounting.document.DocumentFieldsUtils.getDouble;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.fxml.FXML;
import javafx.scene.control.Alert;
import javafx.scene.control.Button;
import javafx.scene.control.ComboBox;
import javafx.scene.control.TextField;
import javafx.scene.input.KeyCode;
import javafx.scene.input.KeyEvent;
import lv.degra.accounting.document.bill.model.UnitType;
import lv.degra.accounting.document.bill.service.BillRowService;
import lv.degra.accounting.document.bill.service.UnitTypeService;
import lv.degra.accounting.document.dto.BillContentDto;
import lv.degra.accounting.system.configuration.service.ConfigService;
import lv.degra.accounting.system.object.DynamicTableView;
import lv.degra.accounting.system.utils.DegraController;

@Component
public class BillController extends DegraController {

	private static final Double PERCENT_TOTALLY = 100.0;
	private final ObservableList<BillContentDto> billContentObservableList = FXCollections.observableArrayList();
	public BillContentDto newBillContentDto;
	@FXML
	public TextField billRowServiceNameField;
	@FXML
	public ComboBox<UnitType> billRowUnitTypeCombo;
	@FXML
	public TextField billRowQuantityField;
	@FXML
	public TextField billRowPricePerUnitField;
	@FXML
	public TextField billRowSumPerAllField;
	@FXML
	public TextField billRowVatPercentField;
	@FXML
	public TextField billRowVatSumField;
	@FXML
	public TextField billRowSumTotalField;
	@FXML
	public Button billRowSaveButton;
	@FXML
	public DynamicTableView<BillContentDto> billContentListView = new DynamicTableView<>();
	@Autowired
	protected BillRowService billRowService;
	private DocumentMainController documentMainController;
	@Autowired
	private ConfigService configService;

	@Autowired
	private UnitTypeService unitTypeService;

	@FXML
	public void addToBillRowButtonAction() {
		addRecord();
		billRowServiceNameField.requestFocus();
	}

	@Override
	protected void addRecord() {
		documentMainController.disableDocumentButtons();
		enableBillRowEnterFields();
		billRowServiceNameField.requestFocus();
		billRowVatPercentField.setText(configService.get(VAT_PERCENTS));
	}

	@Override
	protected void editRecord() {
		newBillContentDto = getRowFromTableView(billContentListView);
		documentMainController.disableDocumentButtons();
		enableBillRowEnterFields();
		fillBillRowFields(newBillContentDto);
		billRowServiceNameField.requestFocus();
	}

	@Override
	protected void deleteRecord() {
		newBillContentDto = getRowFromTableView(billContentListView);
		if (documentMainController.getDocumentDto() == null) {
			return;
		}
		billRowService.deleteBillRowById(documentMainController.getDocumentDto().getId());
		billContentListView.getItems().removeAll(billContentListView.getSelectionModel().getSelectedItem());
	}

	public void injectMainController(DocumentMainController documentMainController) {
		this.documentMainController = documentMainController;
	}

	public void setBillContentOpenAction() {

		billRowUnitTypeCombo.addEventFilter(KeyEvent.KEY_PRESSED, event -> {
			if (event.getCode() == KeyCode.ESCAPE) {
				disableBillRowEnterFields();
				event.consume();
			}
		});

		newBillContentDto = null;
		fillCombo(billRowUnitTypeCombo, unitTypeService.getAllUnitTypes());
		disableBillRowEnterFields();
		billRowServiceNameField.requestFocus();

		billContentListView.setType(BillContentDto.class);
		billContentListView.setCreator(item -> {
			addRecord();
			refreshBillContentTable();
		});
		billContentListView.setUpdater(item -> editRecord());
		billContentListView.setDeleter(item -> deleteRecord());

		refreshBillContentTable();
	}

	private void enableBillRowEnterFields() {
		changeFieldStatus(false);
	}

	protected void disableBillRowEnterFields() {
		changeFieldStatus(true);
		clearBillEnterFields();
	}

	private void changeFieldStatus(boolean setDisable) {
		billRowServiceNameField.setDisable(setDisable);
		billRowUnitTypeCombo.setDisable(setDisable);
		billRowQuantityField.setDisable(setDisable);
		billRowPricePerUnitField.setDisable(setDisable);
		billRowSumPerAllField.setDisable(setDisable);
		billRowVatPercentField.setDisable(setDisable);
		billRowVatSumField.setDisable(setDisable);
		billRowSumTotalField.setDisable(setDisable);
		billRowSaveButton.setDisable(setDisable);
	}

	public void onKeyPressOnBillEditAction(KeyEvent keyEvent) {
		KeyCode key = keyEvent.getCode();
		if (key == KeyCode.ESCAPE) {
			clearBillEnterFields();
			disableBillRowEnterFields();
			documentMainController.enableDocumentButtons();
			billContentListView.requestFocus();
			keyEvent.consume();
		} else if (key == KeyCode.ENTER) {
			recalculateBillRow();
			onSaveRowButton();
			billContentListView.requestFocus();
			keyEvent.consume();
		} else if (key == KeyCode.TAB) {
			recalculateBillRow();
		}
	}

	public void recalculateBillRow() {
		updateTextField(billRowSumPerAllField, getSumPerAll());
		updateTextField(billRowVatSumField, getVatSum());
		updateTextField(billRowSumTotalField, getRowSumTotal());
	}

	public Double getSumPerAll() {
		Double result = null;
		String pricePerUnit = billRowPricePerUnitField.getText();
		String quantity = billRowQuantityField.getText();

		if (!pricePerUnit.isEmpty() && !quantity.isEmpty()) {
			result = getDouble(pricePerUnit) * getDouble(quantity);
		}
		return result;
	}

	public Double getVatSum() {
		Double sumPerAll = getSumPerAll();
		Double vatSum = null;

		if (sumPerAll != null) {
			String vatPercent = billRowVatPercentField.getText();
			if (!vatPercent.isEmpty()) {
				vatSum = (getDouble(vatPercent) / PERCENT_TOTALLY) * sumPerAll;
			}
		}
		return vatSum;
	}

	public Double getRowSumTotal() {
		Double sumPerAll = getSumPerAll();
		Double vatSum = getVatSum();
		Double result = null;

		if (sumPerAll != null && vatSum != null) {
			result = sumPerAll + vatSum;
		}
		return result;
	}

	public void updateTextField(TextField textField, Double value) {
		if (value != null) {
			textField.setText(value.toString());
		}
	}

	private void fillBillRowFields(BillContentDto billContentDto) {
		billRowServiceNameField.setText(billContentDto.getServiceName());
		billRowUnitTypeCombo.setValue(billContentDto.getUnitType());
		billRowQuantityField.setText(billContentDto.getQuantity().toString());
		billRowPricePerUnitField.setText(billContentDto.getPricePerUnit().toString());
		billRowSumPerAllField.setText(billContentDto.getSumPerAll().toString());
		if (billContentDto.getVatPercent() == null) {
			billRowVatPercentField.setText(configService.get("DEFAULT_VAT_PERCENTS"));
		} else {
			billRowVatPercentField.setText(billContentDto.getVatPercent().toString());
		}

		billRowVatSumField.setText(billContentDto.getVatSum().toString());
		billRowSumTotalField.setText(billContentDto.getSumTotal().toString());
	}

	private void clearBillEnterFields() {
		billRowServiceNameField.clear();
		billRowUnitTypeCombo.setValue(null);
		billRowQuantityField.clear();
		billRowPricePerUnitField.clear();
		billRowSumPerAllField.clear();
		billRowVatPercentField.clear();
		billRowVatSumField.clear();
		billRowSumTotalField.clear();
	}

	public void onSaveRowButton() {
		var editedBillContentDto = new BillContentDto();
		try {
			editedBillContentDto = new BillContentDto(newBillContentDto == null ? null : newBillContentDto.getId(),
					documentMainController.getDocumentDto(), billRowServiceNameField.getText(), getDouble(billRowQuantityField.getText()),
					billRowUnitTypeCombo.getValue(), getDouble(billRowPricePerUnitField.getText()),
					getDouble(billRowSumPerAllField.getText()), getDouble(billRowVatPercentField.getText()),
					getDouble(billRowVatSumField.getText()), getDouble(billRowSumTotalField.getText()));

			billRowService.saveBillRow(editedBillContentDto);
		} catch (Exception e) {
			Alert alert = new Alert(Alert.AlertType.NONE);
			alert.setTitle(APPLICATION_TITLE);
			alert.setAlertType(Alert.AlertType.ERROR);
			alert.setContentText(e.getMessage());
			alert.show();
			return;
		}
		if (editedBillContentDto.getId() == null) {
			billContentObservableList.add(newBillContentDto);
		}
		disableBillRowEnterFields();
		documentMainController.enableDocumentButtons();
		refreshBillContentTable();
		billContentListView.requestFocus();
		billContentListView.scrollTo(newBillContentDto);
		newBillContentDto = null;
	}

	public void billRowQuantityOnAction() {
		String billRowQuantity = String.valueOf(getDouble(billRowQuantityField.getText()));
		billRowQuantityField.setText(billRowQuantity);
	}

	protected void refreshBillContentTable() {
		billContentObservableList.clear();
		if (documentMainController.getDocumentDto() != null) {
			billContentObservableList.addAll(billRowService.getByDocumentId(documentMainController.getDocumentDto().getId()));
			billContentListView.setData(billContentObservableList);
		}
	}

}
