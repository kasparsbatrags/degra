package lv.degra.accounting.address.model;

import java.time.LocalDate;

import com.opencsv.bean.CsvBindByPosition;
import com.opencsv.bean.CsvDate;
import com.opencsv.bean.CsvNumber;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class Region extends CsvDataBase {

	@CsvBindByPosition(position = 2)
	private String name;

	@CsvBindByPosition(position = 3)
	@CsvNumber("0")
	private Long parentCode;

	@CsvBindByPosition(position = 4)
	@CsvNumber("0")
	private Integer parentType;

	@CsvBindByPosition(position = 7)
	private String status;

	@CsvBindByPosition(position = 8)
	private String sortName;

	@CsvBindByPosition(position = 9)
	@CsvDate(value = "yyyy.MM.dd")
	private LocalDate dateFrom;

	@CsvBindByPosition(position = 10)
	@CsvDate(value = "dd.MM.yyyy HH:mm:ss")
	private LocalDate dateUpdateAr;

	@CsvBindByPosition(position = 11)
	@CsvDate(value = "yyyy.MM.dd")
	private LocalDate dateTo;

	@CsvBindByPosition(position = 12)
	@CsvNumber("0")
	private Integer territorialUnitCode;

	@CsvBindByPosition(position = 13)
	private String fullAddress;

}
