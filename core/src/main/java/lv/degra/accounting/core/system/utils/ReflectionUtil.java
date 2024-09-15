package lv.degra.accounting.core.system.utils;

import java.lang.reflect.Field;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

public class ReflectionUtil {

	public ReflectionUtil() {
		throw new IllegalStateException("ReflectionUtil class");
	}

	public static Map<String, Object> convertObjectToMap(Object obj) {
		Map<String, Object> dataMap = new HashMap<>();
		Class<?> objClass = obj.getClass();
		Field[] fields = objClass.getDeclaredFields();

		for (Field field : fields) {
			try {
				field.setAccessible(true);
				Object value = field.get(obj);
				if (value instanceof LocalDate localDate) {
//					localDate = (LocalDate) value;
					java.sql.Date sqlDate = java.sql.Date.valueOf(localDate);
					dataMap.put(field.getName(), sqlDate);
				} else {
					dataMap.put(field.getName(), value);
				}
				field.setAccessible(false);
			} catch (IllegalArgumentException | IllegalAccessException e) {
				e.printStackTrace();
			}
		}

		return dataMap;
	}

	private  static String convertToScreamingSnakeCase(String input) {
		return input.replaceAll("([a-z])([A-Z])", "$1_$2").toUpperCase();
	}
}