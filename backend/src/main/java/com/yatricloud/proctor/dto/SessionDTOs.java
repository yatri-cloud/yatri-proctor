package com.yatricloud.proctor.dto;

import jakarta.validation.constraints.*;

public class SessionDTOs {

    public static class ValidateCodeRequest {
        @NotBlank
        @Pattern(regexp = "[A-Za-z0-9\\-]{6,15}", message = "Invalid access code format")
        private String code;

        public ValidateCodeRequest() {}
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
    }

    public static class EquipmentCheckRequest {
        @NotNull private Boolean speakerPass;
        @NotNull private Boolean micPass;
        @NotNull private Boolean webcamPass;

        public EquipmentCheckRequest() {}
        public Boolean getSpeakerPass() { return speakerPass; }
        public void setSpeakerPass(Boolean speakerPass) { this.speakerPass = speakerPass; }
        public Boolean getMicPass() { return micPass; }
        public void setMicPass(Boolean micPass) { this.micPass = micPass; }
        public Boolean getWebcamPass() { return webcamPass; }
        public void setWebcamPass(Boolean webcamPass) { this.webcamPass = webcamPass; }
    }

    public static class SystemCheckRequest {
        @NotNull private Double networkMbps;
        @NotNull private Integer screenCount;

        public SystemCheckRequest() {}
        public Double getNetworkMbps() { return networkMbps; }
        public void setNetworkMbps(Double networkMbps) { this.networkMbps = networkMbps; }
        public Integer getScreenCount() { return screenCount; }
        public void setScreenCount(Integer screenCount) { this.screenCount = screenCount; }
    }

    public static class AnswerRequest {
        @NotNull private Long questionId;
        @NotBlank @Pattern(regexp = "[ABCD]") private String selectedAnswer;
        private Boolean flagged = false;

        public AnswerRequest() {}
        public Long getQuestionId() { return questionId; }
        public void setQuestionId(Long questionId) { this.questionId = questionId; }
        public String getSelectedAnswer() { return selectedAnswer; }
        public void setSelectedAnswer(String selectedAnswer) { this.selectedAnswer = selectedAnswer; }
        public Boolean getFlagged() { return flagged; }
        public void setFlagged(Boolean flagged) { this.flagged = flagged; }
    }

    public static class SubmitRequest {
        private Integer timeRemainingSeconds;

        public SubmitRequest() {}
        public Integer getTimeRemainingSeconds() { return timeRemainingSeconds; }
        public void setTimeRemainingSeconds(Integer timeRemainingSeconds) { this.timeRemainingSeconds = timeRemainingSeconds; }
    }

    public static class SubmitExamRequest extends SubmitRequest {
        public SubmitExamRequest() {}
    }

    public static class IdSelectionRequest {
        @NotBlank private String country;
        @NotBlank private String idType;

        public IdSelectionRequest() {}
        public String getCountry() { return country; }
        public void setCountry(String country) { this.country = country; }
        public String getIdType() { return idType; }
        public void setIdType(String idType) { this.idType = idType; }
    }

    // ── Responses ──────────────────────────────────────

    public static class ValidateCodeResponse {
        private Long sessionId;
        private String sessionToken;
        private String jwt;
        private String candidateName;
        private String examTitle;
        private String examCode;
        private Integer durationMinutes;
        private Integer questionCount;

        public ValidateCodeResponse() {}
        public Long getSessionId() { return sessionId; }
        public void setSessionId(Long sessionId) { this.sessionId = sessionId; }
        public String getSessionToken() { return sessionToken; }
        public void setSessionToken(String sessionToken) { this.sessionToken = sessionToken; }
        public String getJwt() { return jwt; }
        public void setJwt(String jwt) { this.jwt = jwt; }
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
    }

    public static class SessionStateResponse {
        private Long sessionId;
        private String status;
        private Boolean speakerPass;
        private Boolean micPass;
        private Boolean webcamPass;
        private Boolean mobilePaired;
        private String  mobileToken;
        private Boolean personPhotoCaptured;
        private Boolean roomScansComplete;
        private Boolean idVerified;
        private Boolean termsAccepted;
        private Boolean systemCheckPassed;
        private Boolean finalFaceConfirmed;
        private Integer timeRemainingSeconds;
        private Integer scorePercent;
        private String  candidateName;
        private String  examTitle;

        public SessionStateResponse() {}
        public Long getSessionId() { return sessionId; }
        public void setSessionId(Long sessionId) { this.sessionId = sessionId; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public Boolean getSpeakerPass() { return speakerPass; }
        public void setSpeakerPass(Boolean speakerPass) { this.speakerPass = speakerPass; }
        public Boolean getMicPass() { return micPass; }
        public void setMicPass(Boolean micPass) { this.micPass = micPass; }
        public Boolean getWebcamPass() { return webcamPass; }
        public void setWebcamPass(Boolean webcamPass) { this.webcamPass = webcamPass; }
        public Boolean getMobilePaired() { return mobilePaired; }
        public void setMobilePaired(Boolean mobilePaired) { this.mobilePaired = mobilePaired; }
        public String getMobileToken() { return mobileToken; }
        public void setMobileToken(String mobileToken) { this.mobileToken = mobileToken; }
        public Boolean getPersonPhotoCaptured() { return personPhotoCaptured; }
        public void setPersonPhotoCaptured(Boolean personPhotoCaptured) { this.personPhotoCaptured = personPhotoCaptured; }
        public Boolean getRoomScansComplete() { return roomScansComplete; }
        public void setRoomScansComplete(Boolean roomScansComplete) { this.roomScansComplete = roomScansComplete; }
        public Boolean getIdVerified() { return idVerified; }
        public void setIdVerified(Boolean idVerified) { this.idVerified = idVerified; }
        public Boolean getTermsAccepted() { return termsAccepted; }
        public void setTermsAccepted(Boolean termsAccepted) { this.termsAccepted = termsAccepted; }
        public Boolean getSystemCheckPassed() { return systemCheckPassed; }
        public void setSystemCheckPassed(Boolean systemCheckPassed) { this.systemCheckPassed = systemCheckPassed; }
        public Boolean getFinalFaceConfirmed() { return finalFaceConfirmed; }
        public void setFinalFaceConfirmed(Boolean finalFaceConfirmed) { this.finalFaceConfirmed = finalFaceConfirmed; }
        public Integer getTimeRemainingSeconds() { return timeRemainingSeconds; }
        public void setTimeRemainingSeconds(Integer timeRemainingSeconds) { this.timeRemainingSeconds = timeRemainingSeconds; }
        public Integer getScorePercent() { return scorePercent; }
        public void setScorePercent(Integer scorePercent) { this.scorePercent = scorePercent; }
        public String getCandidateName() { return candidateName; }
        public void setCandidateName(String candidateName) { this.candidateName = candidateName; }
        public String getExamTitle() { return examTitle; }
        public void setExamTitle(String examTitle) { this.examTitle = examTitle; }
    }

    public static class MobileTokenResponse {
        private String mobileToken;
        private String mobileUrl;
        private Long expiresInSeconds;

        public MobileTokenResponse() {}
        public String getMobileToken() { return mobileToken; }
        public void setMobileToken(String mobileToken) { this.mobileToken = mobileToken; }
        public String getMobileUrl() { return mobileUrl; }
        public void setMobileUrl(String mobileUrl) { this.mobileUrl = mobileUrl; }
        public Long getExpiresInSeconds() { return expiresInSeconds; }
        public void setExpiresInSeconds(Long expiresInSeconds) { this.expiresInSeconds = expiresInSeconds; }
    }

    public static class PhotoUploadResponse {
        private Long photoId;
        private String photoType;
        private String message;

        public PhotoUploadResponse() {}
        public Long getPhotoId() { return photoId; }
        public void setPhotoId(Long photoId) { this.photoId = photoId; }
        public String getPhotoType() { return photoType; }
        public void setPhotoType(String photoType) { this.photoType = photoType; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}
