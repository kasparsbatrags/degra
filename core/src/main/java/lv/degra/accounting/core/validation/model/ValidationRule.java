package lv.degra.accounting.core.validation.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lv.degra.accounting.core.document.model.DocumentSubType;

@Getter
@Setter
@Entity
@NoArgsConstructor
@AllArgsConstructor
public class ValidationRule {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false)
	private Integer id;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "object_id")
	private ValidationRuleObject validationObject;
	private boolean isShowInForm;
	private boolean isRequired;
	private boolean isDefaultDisabled;
	private String customValidation;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "error_message_id")
	private ValidationRuleErrorMessage validationRulesErrorMessage;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "document_sub_type_id")
	private DocumentSubType documentSubType;

}