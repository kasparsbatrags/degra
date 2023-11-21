package lv.degra.accounting.system.object;

public interface Creator<T> {
	void create(T item);
}
