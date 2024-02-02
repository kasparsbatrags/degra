package lv.degra.accounting.document;

import java.util.List;
import java.util.function.UnaryOperator;
import java.util.regex.Pattern;

import javafx.collections.FXCollections;
import javafx.scene.control.ComboBox;
import javafx.scene.control.TextField;
import javafx.scene.control.TextFormatter;
import lv.degra.accounting.system.exception.IncorrectSumException;

public class DocumentFieldsUtils {

	public static final String EXCEPTION_TEXT_INCORRECT_SUM = "Nekorekta summa!";

	public static <T> void fillCombo(ComboBox<T> comboBox, List<T> list) {
		comboBox.setItems(FXCollections.observableList(list));
	}

	public static void setFieldFormat(TextField field, String sumRegex) {
		Pattern pattern = Pattern.compile(sumRegex);
		TextFormatter sumTotalDoubleFormatter = new TextFormatter(
				(UnaryOperator<TextFormatter.Change>) change -> pattern.matcher(change.getControlNewText()).matches() ? change : null);
		field.setTextFormatter(sumTotalDoubleFormatter);
	}

	public static Double getDouble(String totalSum) {
		try {
			return Double.parseDouble(totalSum);
		} catch (NumberFormatException e) {
			throw new IncorrectSumException(EXCEPTION_TEXT_INCORRECT_SUM);
		}
	}

}
