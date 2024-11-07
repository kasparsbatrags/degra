package lv.degra.accounting.core.country.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Getter
@Setter
@Table(name = "country")
public class Country {
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

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "last_modified_at")
    private Instant lastModifiedAt;

}