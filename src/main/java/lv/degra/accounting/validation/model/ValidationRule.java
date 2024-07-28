package lv.degra.accounting.validation.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.Setter;
import lv.degra.accounting.document.model.DocumentSubType;

@Getter
@Setter
@Entity
public class ValidationRule {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false)
	private Integer id;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "object_id")
	private ValidationRuleObject validationObject;

	private boolean isRequired;
	private String customValidation;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "error_message_id")
	private ValidationRuleErrorMessage validationRulesErrorMessage;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "document_sub_type_id")
	private DocumentSubType documentSubType;

}