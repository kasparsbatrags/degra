package lv.degra.accounting.system.utils;

import pl.allegro.finance.tradukisto.ValueConverters;

import java.math.BigDecimal;
import java.math.RoundingMode;

public class NumberToWordUtil {
    private static final String SPACE = " ";
    static ValueConverters intConverter = ValueConverters.LATVIAN_INTEGER;

    public static String getWordsFromDouble(double number, String currency) {
        BigDecimal bigDecimalNumber = BigDecimal.valueOf(number);
        int numberPart = bigDecimalNumber.intValue();

        int decimalPart = bigDecimalNumber
                .subtract(BigDecimal.valueOf(numberPart))
                .setScale(2, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .intValueExact();

        String centsName = (decimalPart % 10 == 1 && decimalPart != 11) ? "cents" : "centi";
        return convertIntToWords(numberPart) + SPACE + currency + " un " + convertIntToWords(decimalPart) + SPACE + centsName;
    }

    private static String convertIntToWords(Integer number) {
        return intConverter.asWords(number);
    }
}