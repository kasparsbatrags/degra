package lv.degra.accounting.core.country.model;

import jakarta.persistence.*;
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
    @Column(name = "id", nullable = false)
    private Integer id;

    @Column(name = "name", nullable = false, length = 30)
    private String name;

    @Column(name = "official_state_name", length = 10)
    private String officialStateName;

    @Column(name = "\"alpha-2-code\"", nullable = false, length = 2)
    private String alpha2Code;

    @Column(name = "\"alpha-3-code\"", nullable = false)
    private LocalDate alpha3Code;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "last_modified_at")
    private Instant lastModifiedAt;

}