package lv.degra.accounting.core.system.utils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.text.SimpleDateFormat;
import java.util.Date;

import org.junit.jupiter.api.Test;

class DateUtilTest {

	@Test
	void testGetFormattedDate_NullDate() {
		String result = DateUtil.getFormattedDate(null);
		assertNull(result, "Formatted date should be null when input date is null");
	}

	@Test
	void testGetFormattedDate_ValidDate() throws Exception {
		SimpleDateFormat sdf = new SimpleDateFormat("dd.MM.yyyy");
		Date date = sdf.parse("01.12.2024");
		String result = DateUtil.getFormattedDate(date);
		assertEquals("01.12.2024", result, "Formatted date should match the expected format");
	}

	@Test
	void testGetDayDiffTrunc_NullDates() {
		long result = DateUtil.getDayDiffTrunc(null, null);
		assertEquals(0, result, "Day difference should be 0 when both dates are null");
	}

	@Test
	void testGetDayDiffTrunc_OneNullDate() {
		Date date = new Date();
		long result1 = DateUtil.getDayDiffTrunc(date, null);
		long result2 = DateUtil.getDayDiffTrunc(null, date);
		assertEquals(0, result1, "Day difference should be 0 when one of the dates is null");
		assertEquals(0, result2, "Day difference should be 0 when one of the dates is null");
	}

	@Test
	void testGetDayDiffTrunc_ValidDates() throws Exception {
		SimpleDateFormat sdf = new SimpleDateFormat("dd.MM.yyyy");
		Date date1 = sdf.parse("01.12.2024");
		Date date2 = sdf.parse("03.12.2024");
		long result = DateUtil.getDayDiffTrunc(date1, date2);
		assertEquals(2, result, "Day difference should match the expected value");
	}

	@Test
	void testTruncDate_NullDate() {
		assertThrows(NullPointerException.class, () -> DateUtil.truncDate(null), "Truncating a null date should throw NullPointerException");
	}

	@Test
	void testTruncDate_ValidDate() throws Exception {
		SimpleDateFormat sdf = new SimpleDateFormat("dd.MM.yyyy HH:mm:ss.SSS");
		Date date = sdf.parse("01.12.2024 15:30:45.123");
		Date truncatedDate = DateUtil.truncDate(date);

		SimpleDateFormat truncSdf = new SimpleDateFormat("dd.MM.yyyy HH:mm:ss.SSS");
		assertEquals("01.12.2024 00:00:00.000", truncSdf.format(truncatedDate), "Truncated date should match the expected value");
	}
}

