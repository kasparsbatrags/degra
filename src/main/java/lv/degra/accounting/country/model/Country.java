package lv.degra.accounting.country.model;

import jakarta.persistence.*;

import java.time.Instant;
import java.time.LocalDate;

@Entity
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

    public Instant getLastModifiedAt() {
        return lastModifiedAt;
    }

    public void setLastModifiedAt(Instant lastModifiedAt) {
        this.lastModifiedAt = lastModifiedAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDate getAlpha3Code() {
        return alpha3Code;
    }

    public void setAlpha3Code(LocalDate alpha3Code) {
        this.alpha3Code = alpha3Code;
    }

    public String getAlpha2Code() {
        return alpha2Code;
    }

    public void setAlpha2Code(String alpha2Code) {
        this.alpha2Code = alpha2Code;
    }

    public String getOfficialStateName() {
        return officialStateName;
    }

    public void setOfficialStateName(String officialStateName) {
        this.officialStateName = officialStateName;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }
}