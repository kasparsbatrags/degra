package lv.degra.accounting.configuration;

import org.springframework.context.annotation.Configuration;

@Configuration
public class DegraConfig {

	public static final String MAIN = "/system/main.fxml";
	public static final String STYLE = "/style.css";
	public static final String APPLICATION_TITLE = "DeGra v1.0";
	public static final int DEFAULT_PAY_DAY = 10;
	public static final String SUM_FORMAT_REGEX = "\\d*|\\d+\\.\\d*";
	public static final String CURRENCY_EXCHANGE_RATE_FORMAT_REGEX = "\\d+\\.\\d+";
	public static final String APPLICATION_ICON_FILE = "/image/degra.png";
	public static final String EDIT_FORM_TITLE = "Rediģēt";
	public static final String CRATE_FORM_TITLE = "Pievienot";

}
