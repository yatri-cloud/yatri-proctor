package com.yatricloud.proctor.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "session_answers",
       uniqueConstraints = @UniqueConstraint(columnNames = {"session_id", "question_id"}))
public class SessionAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "session_id")
    private ExamSession session;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_id")
    private Question question;

    @Column(nullable = false, length = 1)
    private String selectedAnswer;

    private Boolean flagged;

    @Column(nullable = false)
    private Instant answeredAt;

    public SessionAnswer() {}

    @PrePersist
    protected void onCreate() {
        if (answeredAt == null) answeredAt = Instant.now();
        if (flagged == null) flagged = false;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public ExamSession getSession() { return session; }
    public void setSession(ExamSession session) { this.session = session; }

    public Question getQuestion() { return question; }
    public void setQuestion(Question question) { this.question = question; }

    public String getSelectedAnswer() { return selectedAnswer; }
    public void setSelectedAnswer(String selectedAnswer) { this.selectedAnswer = selectedAnswer; }

    public Boolean getFlagged() { return flagged; }
    public void setFlagged(Boolean flagged) { this.flagged = flagged; }

    public Instant getAnsweredAt() { return answeredAt; }
    public void setAnsweredAt(Instant answeredAt) { this.answeredAt = answeredAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private ExamSession session;
        private Question question;
        private String selectedAnswer;
        private Boolean flagged;
        private Instant answeredAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder session(ExamSession session) { this.session = session; return this; }
        public Builder question(Question question) { this.question = question; return this; }
        public Builder selectedAnswer(String selectedAnswer) { this.selectedAnswer = selectedAnswer; return this; }
        public Builder flagged(Boolean flagged) { this.flagged = flagged; return this; }
        public Builder answeredAt(Instant answeredAt) { this.answeredAt = answeredAt; return this; }

        public SessionAnswer build() {
            SessionAnswer sa = new SessionAnswer();
            sa.setId(this.id);
            sa.setSession(this.session);
            sa.setQuestion(this.question);
            sa.setSelectedAnswer(this.selectedAnswer);
            sa.setFlagged(this.flagged != null ? this.flagged : false);
            sa.setAnsweredAt(this.answeredAt != null ? this.answeredAt : Instant.now());
            return sa;
        }
    }
}
