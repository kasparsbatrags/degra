package lv.degra.accounting.core.system.configuration.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "config")
@AllArgsConstructor
@NoArgsConstructor
public class Configuration {
	@Id
	@Size(max = 30)
	@Column(name = "key",  length = 30, nullable = false)
	private String key;

	@Size(max = 200)
	@Column(name = "value", length = 30, nullable = false)
	private String value;
}
