package lv.degra.accounting.company.exception;


import lombok.extern.slf4j.Slf4j;

@Slf4j
public class IllegalCsvColumnCountException extends RuntimeException {
	public IllegalCsvColumnCountException(String message) {
		super(message);
	}
}
