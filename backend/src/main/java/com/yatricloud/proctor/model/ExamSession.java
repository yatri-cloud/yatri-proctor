package com.yatricloud.proctor.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "exam_sessions")
public class ExamSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 40)
    private String sessionToken;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "access_code_id")
    private AccessCode accessCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SessionStatus status;

    private Boolean speakerPass;
    private Boolean micPass;
    private Boolean webcamPass;

    private Boolean mobilePaired;
    private String  mobileToken;

    private Boolean personPhotoCaptured;
    private Boolean roomScansComplete;
    private Boolean idVerified;
    private String  idCountry;
    private String  idType;

    private Boolean termsAccepted;
    private Instant termsAcceptedAt;

    private Boolean systemCheckPassed;
    private Double  networkMbps;
    private Integer screenCount;

    private Boolean finalFaceConfirmed;
    private Integer timeRemainingSeconds;

    private Instant submittedAt;
    private Integer scorePercent;

    @Column(columnDefinition = "TEXT")
    private String topicBreakdownJson;

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SessionAnswer> answers = new ArrayList<>();

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Photo> photos = new ArrayList<>();

    @Column(nullable = false)
    private Instant createdAt;

    private Instant updatedAt;

    public ExamSession() {}

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
        if (status == null) status = SessionStatus.CREATED;
        if (mobilePaired == null) mobilePaired = false;
        if (timeRemainingSeconds == null) timeRemainingSeconds = 65 * 60;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    public enum SessionStatus {
        CREATED, EQUIPMENT_CHECK, MOBILE_PAIRED, ENVIRONMENT_CHECK,
        TERMS_ACCEPTED, SYSTEM_CHECK_DONE, IN_PROGRESS, SUBMITTED, EXPIRED, FLAGGED, TERMINATED
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSessionToken() { return sessionToken; }
    public void setSessionToken(String sessionToken) { this.sessionToken = sessionToken; }

    public AccessCode getAccessCode() { return accessCode; }
    public void setAccessCode(AccessCode accessCode) { this.accessCode = accessCode; }

    public SessionStatus getStatus() { return status; }
    public void setStatus(SessionStatus status) { this.status = status; }

    public Boolean getSpeakerPass() { return speakerPass; }
    public void setSpeakerPass(Boolean speakerPass) { this.speakerPass = speakerPass; }

    public Boolean getMicPass() { return micPass; }
    public void setMicPass(Boolean micPass) { this.micPass = micPass; }

    public Boolean getWebcamPass() { return webcamPass; }
    public void setWebcamPass(Boolean webcamPass) { this.webcamPass = webcamPass; }

    public Boolean getMobilePaired() { return mobilePaired; }
    public boolean isMobilePaired() { return Boolean.TRUE.equals(mobilePaired); }
    public void setMobilePaired(Boolean mobilePaired) { this.mobilePaired = mobilePaired; }

    public String getMobileToken() { return mobileToken; }
    public void setMobileToken(String mobileToken) { this.mobileToken = mobileToken; }

    public Boolean getPersonPhotoCaptured() { return personPhotoCaptured; }
    public boolean isPersonPhotoCaptured() { return Boolean.TRUE.equals(personPhotoCaptured); }
    public void setPersonPhotoCaptured(Boolean personPhotoCaptured) { this.personPhotoCaptured = personPhotoCaptured; }

    public Boolean getRoomScansComplete() { return roomScansComplete; }
    public boolean isRoomScansComplete() { return Boolean.TRUE.equals(roomScansComplete); }
    public void setRoomScansComplete(Boolean roomScansComplete) { this.roomScansComplete = roomScansComplete; }

    public Boolean getIdVerified() { return idVerified; }
    public boolean isIdVerified() { return Boolean.TRUE.equals(idVerified); }
    public void setIdVerified(Boolean idVerified) { this.idVerified = idVerified; }

    public String getIdCountry() { return idCountry; }
    public void setIdCountry(String idCountry) { this.idCountry = idCountry; }

    public String getIdType() { return idType; }
    public void setIdType(String idType) { this.idType = idType; }

    public Boolean getTermsAccepted() { return termsAccepted; }
    public void setTermsAccepted(Boolean termsAccepted) { this.termsAccepted = termsAccepted; }

    public Instant getTermsAcceptedAt() { return termsAcceptedAt; }
    public void setTermsAcceptedAt(Instant termsAcceptedAt) { this.termsAcceptedAt = termsAcceptedAt; }

    public Boolean getSystemCheckPassed() { return systemCheckPassed; }
    public void setSystemCheckPassed(Boolean systemCheckPassed) { this.systemCheckPassed = systemCheckPassed; }

    public Double getNetworkMbps() { return networkMbps; }
    public void setNetworkMbps(Double networkMbps) { this.networkMbps = networkMbps; }

    public Integer getScreenCount() { return screenCount; }
    public void setScreenCount(Integer screenCount) { this.screenCount = screenCount; }

    public Boolean getFinalFaceConfirmed() { return finalFaceConfirmed; }
    public void setFinalFaceConfirmed(Boolean finalFaceConfirmed) { this.finalFaceConfirmed = finalFaceConfirmed; }

    public Integer getTimeRemainingSeconds() { return timeRemainingSeconds; }
    public void setTimeRemainingSeconds(Integer timeRemainingSeconds) { this.timeRemainingSeconds = timeRemainingSeconds; }

    public Instant getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(Instant submittedAt) { this.submittedAt = submittedAt; }

    public Integer getScorePercent() { return scorePercent; }
    public void setScorePercent(Integer scorePercent) { this.scorePercent = scorePercent; }

    public String getTopicBreakdownJson() { return topicBreakdownJson; }
    public void setTopicBreakdownJson(String topicBreakdownJson) { this.topicBreakdownJson = topicBreakdownJson; }

    public List<SessionAnswer> getAnswers() { return answers; }
    public void setAnswers(List<SessionAnswer> answers) { this.answers = answers; }

    public List<Photo> getPhotos() { return photos; }
    public void setPhotos(List<Photo> photos) { this.photos = photos; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private String sessionToken;
        private AccessCode accessCode;
        private SessionStatus status;
        private Boolean speakerPass;
        private Boolean micPass;
        private Boolean webcamPass;
        private Boolean mobilePaired;
        private String mobileToken;
        private Boolean personPhotoCaptured;
        private Boolean roomScansComplete;
        private Boolean idVerified;
        private String idCountry;
        private String idType;
        private Boolean termsAccepted;
        private Instant termsAcceptedAt;
        private Boolean systemCheckPassed;
        private Double networkMbps;
        private Integer screenCount;
        private Boolean finalFaceConfirmed;
        private Integer timeRemainingSeconds;
        private Instant submittedAt;
        private Integer scorePercent;
        private String topicBreakdownJson;
        private List<SessionAnswer> answers = new ArrayList<>();
        private List<Photo> photos = new ArrayList<>();

        public Builder id(Long id) { this.id = id; return this; }
        public Builder sessionToken(String sessionToken) { this.sessionToken = sessionToken; return this; }
        public Builder accessCode(AccessCode accessCode) { this.accessCode = accessCode; return this; }
        public Builder status(SessionStatus status) { this.status = status; return this; }
        public Builder speakerPass(Boolean speakerPass) { this.speakerPass = speakerPass; return this; }
        public Builder micPass(Boolean micPass) { this.micPass = micPass; return this; }
        public Builder webcamPass(Boolean webcamPass) { this.webcamPass = webcamPass; return this; }
        public Builder mobilePaired(Boolean mobilePaired) { this.mobilePaired = mobilePaired; return this; }
        public Builder mobileToken(String mobileToken) { this.mobileToken = mobileToken; return this; }
        public Builder personPhotoCaptured(Boolean personPhotoCaptured) { this.personPhotoCaptured = personPhotoCaptured; return this; }
        public Builder roomScansComplete(Boolean roomScansComplete) { this.roomScansComplete = roomScansComplete; return this; }
        public Builder idVerified(Boolean idVerified) { this.idVerified = idVerified; return this; }
        public Builder idCountry(String idCountry) { this.idCountry = idCountry; return this; }
        public Builder idType(String idType) { this.idType = idType; return this; }
        public Builder termsAccepted(Boolean termsAccepted) { this.termsAccepted = termsAccepted; return this; }
        public Builder termsAcceptedAt(Instant termsAcceptedAt) { this.termsAcceptedAt = termsAcceptedAt; return this; }
        public Builder systemCheckPassed(Boolean systemCheckPassed) { this.systemCheckPassed = systemCheckPassed; return this; }
        public Builder networkMbps(Double networkMbps) { this.networkMbps = networkMbps; return this; }
        public Builder screenCount(Integer screenCount) { this.screenCount = screenCount; return this; }
        public Builder finalFaceConfirmed(Boolean finalFaceConfirmed) { this.finalFaceConfirmed = finalFaceConfirmed; return this; }
        public Builder timeRemainingSeconds(Integer timeRemainingSeconds) { this.timeRemainingSeconds = timeRemainingSeconds; return this; }
        public Builder submittedAt(Instant submittedAt) { this.submittedAt = submittedAt; return this; }
        public Builder scorePercent(Integer scorePercent) { this.scorePercent = scorePercent; return this; }
        public Builder topicBreakdownJson(String topicBreakdownJson) { this.topicBreakdownJson = topicBreakdownJson; return this; }
        public Builder answers(List<SessionAnswer> answers) { this.answers = answers; return this; }
        public Builder photos(List<Photo> photos) { this.photos = photos; return this; }

        public ExamSession build() {
            ExamSession s = new ExamSession();
            s.setId(this.id);
            s.setSessionToken(this.sessionToken);
            s.setAccessCode(this.accessCode);
            s.setStatus(this.status != null ? this.status : SessionStatus.CREATED);
            s.setSpeakerPass(this.speakerPass);
            s.setMicPass(this.micPass);
            s.setWebcamPass(this.webcamPass);
            s.setMobilePaired(this.mobilePaired != null ? this.mobilePaired : false);
            s.setMobileToken(this.mobileToken);
            s.setPersonPhotoCaptured(this.personPhotoCaptured);
            s.setRoomScansComplete(this.roomScansComplete);
            s.setIdVerified(this.idVerified);
            s.setIdCountry(this.idCountry);
            s.setIdType(this.idType);
            s.setTermsAccepted(this.termsAccepted);
            s.setTermsAcceptedAt(this.termsAcceptedAt);
            s.setSystemCheckPassed(this.systemCheckPassed);
            s.setNetworkMbps(this.networkMbps);
            s.setScreenCount(this.screenCount);
            s.setFinalFaceConfirmed(this.finalFaceConfirmed);
            s.setTimeRemainingSeconds(this.timeRemainingSeconds);
            s.setSubmittedAt(this.submittedAt);
            s.setScorePercent(this.scorePercent);
            s.setTopicBreakdownJson(this.topicBreakdownJson);
            if (this.answers != null) s.setAnswers(this.answers);
            if (this.photos != null) s.setPhotos(this.photos);
            return s;
        }
    }
}
