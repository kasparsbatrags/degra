package lv.degra.accounting.core.system.utils;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

class NumberToWordUtilTest {

	private static final String DEFAULT_CURRENCY = "EUR";

	private void assertWords(double number, String expectedWords) {
		String result = NumberToWordUtil.getWordsFromDouble(number, DEFAULT_CURRENCY);
		Assertions.assertEquals(expectedWords, result);
	}

	@Test
	void testGetWordsWithWholeNumber() {
		assertWords(123, "viens simts divdesmit trīs " + DEFAULT_CURRENCY + " un nulle centi");
	}

	@Test
	void testGetWordsWithDecimalNumber() {
		assertWords(123.45, "viens simts divdesmit trīs " + DEFAULT_CURRENCY + " un četrdesmit pieci centi");
	}

	@Test
	void testGetWordsWithOnlyDecimalNumberSingularNumber() {
		assertWords(0.91, "nulle " + DEFAULT_CURRENCY + " un deviņdesmit viens cents");
	}

	@Test
	void testGetWordsWithOnlyDecimalNumberTwelve() {
		assertWords(0.12, "nulle " + DEFAULT_CURRENCY + " un divpadsmit centi");
	}

	@Test
	void testGetWordsWithZero() {
		assertWords(0, "nulle " + DEFAULT_CURRENCY + " un nulle centi");
	}

	@Test
	void testGetWordsWithRoundedDecimal() {
		assertWords(123.46, "viens simts divdesmit trīs " + DEFAULT_CURRENCY + " un četrdesmit seši centi");
	}

	@Test
	void testGetWordsWithThousandDecimal() {
		assertWords(12322.47, "divpadsmit tūkstoši trīs simti divdesmit divi " + DEFAULT_CURRENCY + " un četrdesmit septiņi centi");
	}

	@Test
	void testGetWordsWithMillionDecimal() {
		assertWords(1232192.456, "viens miljons divi simti trīsdesmit divi tūkstoši viens simts deviņdesmit divi " + DEFAULT_CURRENCY + " un četrdesmit seši centi");
	}


	@Test
	void testGetWordsWithLargeNumber() {
		assertWords(1_000_000_000.99, "viens miljards " + DEFAULT_CURRENCY + " un deviņdesmit deviņi centi");
	}

	@Test
	void testGetWordsWithEdgeCaseDecimal() {
		assertWords(0.01, "nulle " + DEFAULT_CURRENCY + " un viens cents");
		assertWords(0.99, "nulle " + DEFAULT_CURRENCY + " un deviņdesmit deviņi centi");
	}

	@Test
	void testGetWordsWithSingularAndPluralCents() {
		// Gadījums, kad cents ir vienskaitlī ("cents")
		assertWords(0.01, "nulle EUR un viens cents");

		// Gadījums, kad cents ir daudzskaitlī ("centi")
		assertWords(0.11, "nulle EUR un vienpadsmit centi");
		assertWords(0.21, "nulle EUR un divdesmit viens cents");
		assertWords(0.02, "nulle EUR un divi centi");
	}
}
