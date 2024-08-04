package lv.degra.accounting.core.system.utils;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.concurrent.TimeUnit;


public class DateUtil {
	public static final String DATE_FORMAT = "dd.MM.yyyy";

	private DateUtil() {
	}

	public static String getFormattedDate(Date date) {
		DateFormat dateFormat = new SimpleDateFormat(DATE_FORMAT);
		return date != null ? dateFormat.format(date) : null;
	}

	public static long getDayDiffTrunc(Date d1, Date d2) {
		long result = 0L;

		if (d1 != null && d2 != null) {
			long diff = truncDate(d2).getTime() - truncDate(d1).getTime();
			result = TimeUnit.DAYS.convert(diff, TimeUnit.MILLISECONDS);
		}

		return Math.abs(result);
	}

	public static Date truncDate(Date date) {
		Calendar calendar = Calendar.getInstance();
		calendar.setTime(date);
		calendar.set(Calendar.HOUR_OF_DAY, 0);
		calendar.set(Calendar.MINUTE, 0);
		calendar.set(Calendar.SECOND, 0);
		calendar.set(Calendar.MILLISECOND, 0);

		return calendar.getTime();
	}

}
