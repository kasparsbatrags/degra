package lv.degra.accounting.core.system.utils;

import java.lang.reflect.Field;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

import lombok.NoArgsConstructor;

@NoArgsConstructor
public class ReflectionUtil {

	public static Map<String, Object> convertObjectToMap(Object obj) {
		Map<String, Object> dataMap = new HashMap<>();
		Class<?> objClass = obj.getClass();
		Field[] fields = objClass.getDeclaredFields();

		for (Field field : fields) {
			try {
				Object value = field.get(obj);
				if (value instanceof LocalDate localDate) {
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
}