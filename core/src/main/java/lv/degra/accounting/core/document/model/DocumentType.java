package lv.degra.accounting.core.document.model;

import java.io.Serializable;
import java.util.Objects;

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
	@Column(name = "title", nullable = false)
	private String title;

	@Size(max = 30)
	@Column(name = "name", nullable = false)
	private String name;

	@Size(max = 10)
	@Column(name = "code", nullable = false)
	private String code;

	@Override
	public String toString() {
		return getTitle();
	}

	@Override
	public boolean equals(Object o) {
		if (o == null || getClass() != o.getClass())
			return false;
		DocumentType that = (DocumentType) o;
		return Objects.equals(id, that.id) && Objects.equals(title, that.title) && Objects.equals(name, that.name)
				&& Objects.equals(code, that.code);
	}

	@Override
	public int hashCode() {
		return Objects.hash(id, title, name, code);
	}
}

