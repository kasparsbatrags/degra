package lv.degra.accounting.system.configuration.service;

public interface ConfigService {
	void save(String key, String value);

	String get(String key);

	int getInt(String key);

	boolean getBoolean(String key);
}
