package lv.degra.accounting.core.user.model;

import java.io.Serializable;
import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import lv.degra.accounting.core.auditor.model.AuditInfo;

@Getter
@Setter
@Entity
@Table(name = "\"user\"")
public class User extends AuditInfo implements Serializable {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false)
	private Integer id;

	@Column(name = "user_id", unique = true, nullable = false)
	private String userId;

	@Column(name = "refresh_token", length = 4096)
	private String refreshToken;

	@Column(name = "last_login_time")
	private Instant lastLoginTime;

	@Column(name = "created_at", nullable = false, updatable = false)
	private Instant createdAt = Instant.now();

	@Column(name = "updated_at")
	private Instant updatedAt = Instant.now();


}
