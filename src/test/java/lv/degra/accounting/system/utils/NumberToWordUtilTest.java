package lv.degra.accounting.system.utils;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

class NumberToWordUtilTest {

    private static final String DEFAULT_CURRENCY = "EUR";

    @Test
     void testGetWordsWithWholeNumber() {
        String result = NumberToWordUtil.getWordsFromDouble(123, DEFAULT_CURRENCY);
        Assertions.assertEquals("viens simts divdesmit trīs " + DEFAULT_CURRENCY + " un nulle centi", result);
    }

    @Test
     void testGetWordsWithDecimalNumber() {
        String result = NumberToWordUtil.getWordsFromDouble(123.45, DEFAULT_CURRENCY);
        Assertions.assertEquals("viens simts divdesmit trīs " + DEFAULT_CURRENCY + " un četrdesmit pieci centi", result);
    }

    @Test
     void testGetWordsWithOnlyDecimalNumberSingular() {
        String result = NumberToWordUtil.getWordsFromDouble(0.91, DEFAULT_CURRENCY);
        Assertions.assertEquals("nulle " + DEFAULT_CURRENCY + " un deviņdesmit viens cents", result);
    }

    @Test
     void testGetWordsWithOnlyDecimalNumber() {
        String result = NumberToWordUtil.getWordsFromDouble(0.91, DEFAULT_CURRENCY);
        Assertions.assertEquals("nulle " + DEFAULT_CURRENCY + " un deviņdesmit viens cents", result);
    }

    @Test
     void testGetWordsWithOnlyDecimalNumberTwelve() {
        String result = NumberToWordUtil.getWordsFromDouble(0.12, DEFAULT_CURRENCY);
        Assertions.assertEquals("nulle " + DEFAULT_CURRENCY + " un divpadsmit centi", result);
    }

    @Test
     void testGetWordsWithZero() {
        String result = NumberToWordUtil.getWordsFromDouble(0, DEFAULT_CURRENCY);
        Assertions.assertEquals("nulle " + DEFAULT_CURRENCY + " un nulle centi", result);
    }

    @Test
     void testGetWordsWithRoundedDecimal() {
        String result = NumberToWordUtil.getWordsFromDouble(123.46, DEFAULT_CURRENCY);
        Assertions.assertEquals("viens simts divdesmit trīs " + DEFAULT_CURRENCY + " un četrdesmit seši centi", result);
    }

    @Test
     void testGetWordsWithThousandDecimal() {
        String result = NumberToWordUtil.getWordsFromDouble(12322.47, DEFAULT_CURRENCY);
        Assertions.assertEquals("divpadsmit tūkstoši trīs simti divdesmit divi " + DEFAULT_CURRENCY + " un četrdesmit septiņi centi", result);
    }

    @Test
     void testGetWordsWithMillionDecimal() {
        String result = NumberToWordUtil.getWordsFromDouble(1232192.456, DEFAULT_CURRENCY);
        Assertions.assertEquals("viens miljons divi simti trīsdesmit divi tūkstoši viens simts deviņdesmit divi " + DEFAULT_CURRENCY + " un četrdesmit seši centi", result);
    }

}
