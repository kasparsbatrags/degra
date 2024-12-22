package lv.degra.accounting.core.user.client;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.test.context.ContextConfiguration;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

@ContextConfiguration(classes = KeycloakPropertiesTest.TestConfig.class)
@EnableConfigurationProperties(KeycloakProperties.class)
class KeycloakPropertiesTest {

	private Validator validator;

	@BeforeEach
	void setUp() {
		try (ValidatorFactory factory = Validation.buildDefaultValidatorFactory()) {
			validator = factory.getValidator();
		}
	}

	@Test
	void testDefaultValues() {
		KeycloakProperties properties = new KeycloakProperties();
		assertEquals(5000, properties.getConnectionTimeout(), "Default connectionTimeout should be 5000");
		assertEquals(5000, properties.getReadTimeout(), "Default readTimeout should be 5000");
	}

	@Test
	void testValidProperties() {
		KeycloakProperties properties = new KeycloakProperties();
		properties.setAuthServerUrl("http://localhost:8080");
		properties.setRealm("test-realm");
		properties.setClientId("test-client");
		properties.setClientSecret("test-secret");

		assertEquals("http://localhost:8080", properties.getAuthServerUrl(), "authServerUrl should match");
		assertEquals("test-realm", properties.getRealm(), "realm should match");
		assertEquals("test-client", properties.getClientId(), "clientId should match");
		assertEquals("test-secret", properties.getClientSecret(), "clientSecret should match");
	}

	@Test
	void testInvalidProperties() {
		KeycloakProperties properties = new KeycloakProperties();

		properties.setAuthServerUrl("");
		properties.setRealm("");
		properties.setClientId("");
		properties.setClientSecret("");

		Set<ConstraintViolation<KeycloakProperties>> violations = validator.validate(properties);

		assertFalse(violations.isEmpty(), "Expected constraint violations for invalid properties");

		violations.forEach(violation -> {
			switch (violation.getPropertyPath().toString()) {
			case "authServerUrl":
				assertEquals("must not be blank", violation.getMessage(), "Validation message for authServerUrl");
				break;
			case "realm":
				assertEquals("must not be blank", violation.getMessage(), "Validation message for realm");
				break;
			case "clientId":
				assertEquals("must not be blank", violation.getMessage(), "Validation message for clientId");
				break;
			case "clientSecret":
				assertEquals("must not be blank", violation.getMessage(), "Validation message for clientSecret");
				break;
			default:
				throw new AssertionError("Unexpected validation error for: " + violation.getPropertyPath());
			}
		});
	}

	@Configuration
	static class TestConfig {
		// Šeit var pievienot papildu @Bean anotācijas, ja nepieciešams
	}
}
