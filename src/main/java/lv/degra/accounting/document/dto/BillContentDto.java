package lv.degra.accounting.document.dto;

import java.io.Serializable;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lv.degra.accounting.document.bill.model.UnitType;
import lv.degra.accounting.system.object.TableViewInfo;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class BillContentDto implements Serializable {
	private Integer id;
	@NotNull
	private DocumentDto documentDto;
	@Size(max = 150)
	@NotNull
	@TableViewInfo(displayName = "Nosaukums", columnOrder = 1)
	private String serviceName;
	@NotNull
	@TableViewInfo(displayName = "Daudzums", columnOrder = 2)
	private Double quantity;
	@TableViewInfo(displayName = "Mērvienība", columnOrder = 3)
	@NotNull
	private UnitType unitType;
	@NotNull
	@TableViewInfo(displayName = "Vienības cena", columnOrder = 4)
	private Double pricePerUnit;
	@NotNull
	@TableViewInfo(displayName = "Summa", columnOrder = 5)
	private Double sumPerAll;
	@TableViewInfo(displayName = "PVN %", columnOrder = 6)
	private Double vatPercent;
	@TableViewInfo(displayName = "PVN summa", columnOrder = 7)
	private Double vatSum;
	@TableViewInfo(displayName = "Summa kopā", columnOrder = 8)
	private Double sumTotal;
}
