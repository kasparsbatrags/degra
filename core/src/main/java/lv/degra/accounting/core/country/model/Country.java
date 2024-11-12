package lv.degra.accounting.core.country.model;

import java.io.Serializable;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lv.degra.accounting.core.auditor.model.AuditInfo;

@Entity
@Getter
@Setter
@Table(name = "country")
public class Country extends AuditInfo implements Serializable {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id")
	@NotNull
	private Integer id;

	@Column(name = "name", length = 30)
	@NotNull
	private String name;

	@Column(name = "official_state_name", length = 10)
	private String officialStateName;

	@Column(name = "\"alpha-2-code\"", length = 2)
	@NotNull
	private String alpha2Code;

	@Column(name = "\"alpha-3-code\"")
	@NotNull
	private LocalDate alpha3Code;
}