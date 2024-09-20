package lv.degra.accounting.core.address.register.model;

import com.opencsv.bean.CsvBindByPosition;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Builder
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CsvDataBase implements AddressData{

	@CsvBindByPosition(position = 0)
	private Long code;

	@CsvBindByPosition(position = 1)
	private Integer type;

}
