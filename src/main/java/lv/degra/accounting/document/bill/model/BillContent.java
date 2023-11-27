package lv.degra.accounting.document.bill.model;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import lv.degra.accounting.document.model.Document;

@Getter
@Setter
@Entity
@Table(name = "document_bill_content")
public class BillContent {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false)
	private Integer id;

	@NotNull
	@ManyToOne(fetch = FetchType.EAGER, optional = false)
	@JoinColumn(name = "document_id", nullable = false)
	private Document document;

	@Size(max = 150)
	@Column(name = "service_name", length = 150)
	private String serviceName;

	@Column(name = "quantity", nullable = false)
	private Double quantity;

	@Column(name = "price_per_unit", nullable = false)
	private Double pricePerUnit;

	@Column(name = "sum_per_all", nullable = false)
	private Double sumPerAll;

	@Column(name = "vat_percent")
	private Double vatPercent;

	@Column(name = "vat_sum")
	private Double vatSum;

	@Column(name = "sum_total")
	private Double sumTotal;

	@Column(name = "created_at")
	private Instant createdAt;

	@Column(name = "last_modified_at")
	private Instant lastModifiedAt;

}
