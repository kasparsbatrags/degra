package lv.degra.accounting.document.dto;

import java.io.Serializable;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lv.degra.accounting.system.object.TableViewInfo;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class DocumentContentDto implements Serializable {
	private Integer id;
	private DocumentDto documentDto;
	@Size(max = 150)
	@NotNull
	@TableViewInfo(displayName = "Nosaukums", columnOrder = 1)
	private String serviceName;
	@NotNull
	@TableViewInfo(displayName = "Daudzums", columnOrder = 2)
	private Double quantity;
	@NotNull
	@TableViewInfo(displayName = "Vienības cena", columnOrder = 3)
	private Double pricePerUnit;
	@NotNull
	@TableViewInfo(displayName = "Summa", columnOrder = 4)
	private Double sumPerAll;
	@TableViewInfo(displayName = "PVN %", columnOrder = 5)
	private Double vatPercent;
	@TableViewInfo(displayName = "PVN summa", columnOrder = 6)
	private Double vatSum;
	@TableViewInfo(displayName = "Summa kopā", columnOrder = 7)
	private Double sumTotal;
}
