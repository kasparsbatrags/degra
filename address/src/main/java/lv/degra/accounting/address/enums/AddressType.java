package lv.degra.accounting.address.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum AddressType {

	CITY(104), REGION(113), PARISH(105);

	private final int value;
}
