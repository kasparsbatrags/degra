package lv.degra.accounting.document.model;

import java.io.Serializable;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "document_type")
public class DocumentType implements Serializable {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false)
	private Integer id;

	@Size(max = 30)
	@Column(name = "name", nullable = false)
	private String name;

	@Size(max = 10)
	@Column(name = "code", nullable = false)
	private String code;

	@Override
	public String toString() {
		return getName();
	}
}

