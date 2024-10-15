package lv.degra.accounting.core.system.component;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.FIELD)
public @interface TableViewInfo {
	String displayName();

	int columnOrder() default 0;

	boolean useAsSearchComboBox() default false;

	Class<?> searchServiceClass() default Void.class;
}