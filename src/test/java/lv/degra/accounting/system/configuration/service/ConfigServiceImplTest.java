package lv.degra.accounting.system.configuration.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import lv.degra.accounting.system.configuration.model.Configuration;
import lv.degra.accounting.system.configuration.model.ConfigurationRepository;
import lv.degra.accounting.system.exception.IllegalDataArgumentException;

class ConfigServiceImplTest {

	@Mock
	private ConfigurationRepository configurationRepository;

	@InjectMocks
	private ConfigServiceImpl configService;

	@BeforeEach
	void setUp() {
		MockitoAnnotations.openMocks(this);
	}

	@Test
	void save_ValidKeyAndValue_ShouldSaveConfiguration() {
		String key = "testKey";
		String value = "testValue";
		Configuration existingConfiguration = new Configuration(key, null);

		when(configurationRepository.findByKey(key)).thenReturn(existingConfiguration);

		configService.save(key, value);

		ArgumentCaptor<Configuration> configurationCaptor = ArgumentCaptor.forClass(Configuration.class);
		verify(configurationRepository).save(configurationCaptor.capture());
		Configuration savedConfiguration = configurationCaptor.getValue();
		assertEquals(key, savedConfiguration.getKey());
		assertEquals(value, savedConfiguration.getValue());
	}

	@Test
	void save_NewKeyAndValue_ShouldSaveNewConfiguration() {
		String key = "newKey";
		String value = "newValue";

		when(configurationRepository.findByKey(key)).thenReturn(null);

		configService.save(key, value);

		ArgumentCaptor<Configuration> configurationCaptor = ArgumentCaptor.forClass(Configuration.class);
		verify(configurationRepository).save(configurationCaptor.capture());

		Configuration savedConfiguration = configurationCaptor.getValue();
		assertNotNull(savedConfiguration);
		assertEquals(key, savedConfiguration.getKey());
		assertEquals(value, savedConfiguration.getValue());
	}

	@Test
	void save_NullKey_ShouldThrowIllegalDataArgumentException() {
		assertThrows(IllegalDataArgumentException.class, () -> configService.save(null, "value"));
	}

	@Test
	void save_NullValue_ShouldThrowIllegalDataArgumentException() {
		assertThrows(IllegalDataArgumentException.class, () -> configService.save("key", null));
	}

	@Test
	void get_ExistingKey_ShouldReturnValue() {
		String key = "existingKey";
		String expectedValue = "existingValue";
		Configuration existingConfiguration = new Configuration();
		existingConfiguration.setKey(key);
		existingConfiguration.setValue(expectedValue);

		when(configurationRepository.findByKey(key)).thenReturn(existingConfiguration);

		String actualValue = configService.get(key);

		assertEquals(expectedValue, actualValue);
	}

	@Test
	void get_NonexistentKey_ShouldReturnNull() {
		String key = "nonexistentKey";

		when(configurationRepository.findByKey(key)).thenReturn(null);

		String actualValue = configService.get(key);

		assertNull(actualValue);
	}

	@Test
	void getInt_ValidKeyAndValue_ShouldReturnIntValue() {
		String key = "intKey";
		String value = "42";

		when(configurationRepository.findByKey(key)).thenReturn(new Configuration(key, value));

		int intValue = configService.getInt(key);

		assertEquals(42, intValue);
	}

	@Test
	void getInt_InvalidKeyOrValue_ShouldReturnDefaultIntValue() {
		String key = "invalidKey";
		String invalidValue = "invalidValue";

		when(configurationRepository.findByKey(key)).thenReturn(new Configuration(key, invalidValue));

		int defaultValue = configService.getInt(key);

		assertEquals(0, defaultValue);
	}

	@Test
	void getBoolean_ValidKeyAndValueTrue_ShouldReturnTrue() {
		String key = "booleanKey";
		String value = "true";

		when(configurationRepository.findByKey(key)).thenReturn(new Configuration(key, value));

		assertTrue(configService.getBoolean(key));
	}

	@Test
	void getBoolean_ValidKeyAndValueFalse_ShouldReturnFalse() {
		String key = "booleanKey";
		String value = "false";

		when(configurationRepository.findByKey(key)).thenReturn(new Configuration(key, value));

		assertFalse(configService.getBoolean(key));
	}

	@Test
	void getBoolean_InvalidKeyOrValue_ShouldReturnFalse() {
		String key = "invalidBooleanKey";
		String invalidValue = "invalidValue";

		when(configurationRepository.findByKey(key)).thenReturn(new Configuration(key, invalidValue));

		assertFalse(configService.getBoolean(key));
	}
}
