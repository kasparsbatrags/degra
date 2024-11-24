package lv.degra.accounting.core.auditor.model;

import java.time.LocalDateTime;

import org.hibernate.envers.Audited;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;

@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
@Audited
public class AuditInfo {

	@CreatedDate
	private LocalDateTime createdDateTime;

	@LastModifiedDate
	@Temporal(TemporalType.TIMESTAMP)
	private LocalDateTime lastModifiedDateTime;

}
