package lv.degra.accounting.system.configuration.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lv.degra.accounting.system.configuration.model.Configuration;
import lv.degra.accounting.system.configuration.model.ConfigurationRepository;
import lv.degra.accounting.system.exception.IllegalDataArgumentException;

@Service
public class ConfigServiceImpl implements ConfigService {

	private static final int DEFAULT_INT_VALUE = 0;
	@Autowired
	private ConfigurationRepository configurationRepository;

	public void save(String key, String value) {
		if (key == null || value == null) {
			throw new IllegalDataArgumentException("Key or Value cannot be null");
		}
		Configuration configuration = configurationRepository.findByKey(key);
		if (configuration != null) {
			configuration.setValue(value);
		} else {
			configuration = new Configuration();
			configuration.setKey(key);
			configuration.setValue(value);
		}
		configurationRepository.save(configuration);
	}

	public String get(String key) {
		Configuration configuration = configurationRepository.findByKey(key);
		return configuration != null ? configuration.getValue() : null;
	}

	public int getInt(String key) {
		String value = get(key);
		int result;
		try {
			result = value != null ? Integer.parseInt(value) : DEFAULT_INT_VALUE;
		} catch (NumberFormatException e) {
			result = DEFAULT_INT_VALUE;
		}
		return result;
	}

	public boolean getBoolean(String key) {
		String value = get(key);
		return value != null && Boolean.parseBoolean(value);
	}

}
