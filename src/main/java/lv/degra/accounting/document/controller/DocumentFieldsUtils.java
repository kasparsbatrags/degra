package lv.degra.accounting.document.controller;

import java.util.List;
import java.util.function.UnaryOperator;
import java.util.regex.Pattern;

import javafx.collections.FXCollections;
import javafx.scene.control.ComboBox;
import javafx.scene.control.TextField;
import javafx.scene.control.TextFormatter;
import lv.degra.accounting.document.dto.BillContentDto;
import lv.degra.accounting.system.exception.IncorrectSumException;

public class DocumentFieldsUtils {

	public static final String EXCEPTION_TEXT_INCORRECT_SUM = "Nekorekta summa!";

	public static void fillCombo(ComboBox comboBox, List<?> list) {
		comboBox.setItems(FXCollections.observableList(list));
	}

	public static void setFieldFormat(TextField field, String sumRegex) {
		Pattern pattern = Pattern.compile(sumRegex);
		TextFormatter sumTotalDoubleFormatter = new TextFormatter(
				(UnaryOperator<TextFormatter.Change>) change -> pattern.matcher(change.getControlNewText()).matches() ? change : null);
		field.setTextFormatter(sumTotalDoubleFormatter);
	}

	public static Double getDouble(String totalSum) {
		double result;
		try {
			result = Double.parseDouble(totalSum);
		} catch (RuntimeException e) {
			throw new IncorrectSumException(EXCEPTION_TEXT_INCORRECT_SUM);
		}
		return result;
	}

}
