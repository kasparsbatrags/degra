package lv.degra.accounting.system.object;

public interface Deleter<T> {
	void delete(T item);
}
