package lv.degra.accounting.core.system.configuration;

import org.springframework.context.annotation.Configuration;

import lombok.NoArgsConstructor;

@Configuration
@NoArgsConstructor
public class DegraConfig {

	public static final String API_LINK = "/API";
	public static final String ADDRESS = "/address";
	public static final String COMPANY = "/company";
	public static final String SUGGESTIONS = "/suggestion";
	public static final String IMPORT = "/import";

	public static final String ADDRESS_DOWNLOAD_LINK = "ADDRESS_DATA_LINK";
	public static final String COMPANY_DOWNLOAD_LINK = "COMPANY_DATA_LINK";

}
