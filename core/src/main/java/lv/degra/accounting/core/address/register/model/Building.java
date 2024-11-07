package lv.degra.accounting.core.address.register.model;

import java.time.LocalDate;

import com.opencsv.bean.CsvBindByPosition;
import com.opencsv.bean.CsvDate;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class Building extends CsvDataBase {

	@CsvBindByPosition(position = 2)
	private String status;

	@CsvBindByPosition(position = 5)
	private Long parentCode;

	@CsvBindByPosition(position = 6)
	private Integer parentType;

	@CsvBindByPosition(position = 7)
	private String name;

	@CsvBindByPosition(position = 8)
	private String sortName;

	@CsvBindByPosition(position = 9)
	private String zip;

	@CsvBindByPosition(position = 11)
	@CsvDate(value = "yyyy.MM.dd")
	private LocalDate dateFrom;

	@CsvBindByPosition(position = 12)
	@CsvDate(value = "dd.MM.yyyy HH:mm:ss")
	private LocalDate dateUpdateAr;

	@CsvBindByPosition(position = 13)
	@CsvDate(value = "yyyy.MM.dd")
	private LocalDate dateTo;

	@CsvBindByPosition(position = 16)
	private String fullAddress;
}
