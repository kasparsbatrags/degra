package lv.degra.accounting.core.system.utils;

import java.lang.reflect.Field;
import java.sql.Date;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@NoArgsConstructor
@Slf4j
public class ReflectionUtil {

	public static Map<String, Object> convertObjectToMap(Object obj) {
		Map<String, Object> fieldMap = new HashMap<>();
		if (obj == null) {
			return fieldMap;
		}
		Field[] fields = obj.getClass().getDeclaredFields();
		for (Field field : fields) {
			if (java.lang.reflect.Modifier.isTransient(field.getModifiers())) {
				continue;
			}
			try {
				field.setAccessible(true);
				Object value = field.get(obj);
				if (value instanceof LocalDate) {
					value = Date.valueOf((LocalDate) value);
				}
				fieldMap.put(field.getName(), value);
			} catch (IllegalAccessException e) {
				log.error("Cannot access field: " + field.getName(), e);
			}
		}
		return fieldMap;
	}
}
