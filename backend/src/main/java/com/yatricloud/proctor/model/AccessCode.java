package com.yatricloud.proctor.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "access_codes")
public class AccessCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String code;

    @Column(nullable = false)
    private String candidateName;

    @Column(nullable = false)
    private String examTitle;

    @Column(nullable = false, length = 20)
    private String examCode;

    @Column(nullable = false)
    private Integer durationMinutes;

    @Column(nullable = false)
    private Integer questionCount;

    @Column(nullable = false)
    private Instant validUntil;

    @Column(nullable = false)
    private Instant createdAt;

    public AccessCode() {}

    public AccessCode(Long id, String code, String candidateName, String examTitle, String examCode,
                      Integer durationMinutes, Integer questionCount, Instant validUntil, Instant createdAt) {
        this.id = id;
        this.code = code;
        this.candidateName = candidateName;
        this.examTitle = examTitle;
        this.examCode = examCode;
        this.durationMinutes = durationMinutes;
        this.questionCount = questionCount;
        this.validUntil = validUntil;
        this.createdAt = createdAt;
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
    }

    public boolean isExpired() {
        return Instant.now().isAfter(validUntil);
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getCandidateName() { return candidateName; }
    public void setCandidateName(String candidateName) { this.candidateName = candidateName; }

    public String getExamTitle() { return examTitle; }
    public void setExamTitle(String examTitle) { this.examTitle = examTitle; }

    public String getExamCode() { return examCode; }
    public void setExamCode(String examCode) { this.examCode = examCode; }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }

    public Integer getQuestionCount() { return questionCount; }
    public void setQuestionCount(Integer questionCount) { this.questionCount = questionCount; }

    public Instant getValidUntil() { return validUntil; }
    public void setValidUntil(Instant validUntil) { this.validUntil = validUntil; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    // Builder
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private String code;
        private String candidateName;
        private String examTitle;
        private String examCode;
        private Integer durationMinutes;
        private Integer questionCount;
        private Instant validUntil;
        private Instant createdAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder code(String code) { this.code = code; return this; }
        public Builder candidateName(String candidateName) { this.candidateName = candidateName; return this; }
        public Builder examTitle(String examTitle) { this.examTitle = examTitle; return this; }
        public Builder examCode(String examCode) { this.examCode = examCode; return this; }
        public Builder durationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; return this; }
        public Builder questionCount(Integer questionCount) { this.questionCount = questionCount; return this; }
        public Builder validUntil(Instant validUntil) { this.validUntil = validUntil; return this; }
        public Builder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }

        public AccessCode build() {
            return new AccessCode(id, code, candidateName, examTitle, examCode, durationMinutes, questionCount, validUntil, createdAt);
        }
    }
}
