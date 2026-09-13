package com.yatricloud.proctor.dto;

import java.time.Instant;
import java.util.List;

public class AdminDTOs {

    public static class SessionSummaryDto {
        private Long id;
        private String accessCode;
        private String candidateName;
        private String candidateEmail;
        private String examTitle;
        private String examCode;
        private String status;
        private Integer scorePercent;
        private Boolean speakerPass;
        private Boolean micPass;
        private Boolean webcamPass;
        private Boolean mobilePaired;
        private Boolean personPhotoCaptured;
        private Boolean roomScansComplete;
        private Boolean idVerified;
        private Boolean termsAccepted;
        private Boolean systemCheckPassed;
        private Double networkMbps;
        private Integer timeRemainingSeconds;
        private Instant createdAt;
        private int photoCount;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getAccessCode() { return accessCode; }
        public void setAccessCode(String accessCode) { this.accessCode = accessCode; }
        public String getCandidateName() { return candidateName; }
        public void setCandidateName(String candidateName) { this.candidateName = candidateName; }
        public String getCandidateEmail() { return candidateEmail; }
        public void setCandidateEmail(String candidateEmail) { this.candidateEmail = candidateEmail; }
        public String getExamTitle() { return examTitle; }
        public void setExamTitle(String examTitle) { this.examTitle = examTitle; }
        public String getExamCode() { return examCode; }
        public void setExamCode(String examCode) { this.examCode = examCode; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public Integer getScorePercent() { return scorePercent; }
        public void setScorePercent(Integer scorePercent) { this.scorePercent = scorePercent; }
        public Boolean getSpeakerPass() { return speakerPass; }
        public void setSpeakerPass(Boolean speakerPass) { this.speakerPass = speakerPass; }
        public Boolean getMicPass() { return micPass; }
        public void setMicPass(Boolean micPass) { this.micPass = micPass; }
        public Boolean getWebcamPass() { return webcamPass; }
        public void setWebcamPass(Boolean webcamPass) { this.webcamPass = webcamPass; }
        public Boolean getMobilePaired() { return mobilePaired; }
        public void setMobilePaired(Boolean mobilePaired) { this.mobilePaired = mobilePaired; }
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
        public Double getNetworkMbps() { return networkMbps; }
        public void setNetworkMbps(Double networkMbps) { this.networkMbps = networkMbps; }
        public Integer getTimeRemainingSeconds() { return timeRemainingSeconds; }
        public void setTimeRemainingSeconds(Integer timeRemainingSeconds) { this.timeRemainingSeconds = timeRemainingSeconds; }
        public Instant getCreatedAt() { return createdAt; }
        public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
        public int getPhotoCount() { return photoCount; }
        public void setPhotoCount(int photoCount) { this.photoCount = photoCount; }
    }

    public static class SessionDetailDto extends SessionSummaryDto {
        private List<PhotoDto> photos;
        private List<AnswerDto> answers;

        public List<PhotoDto> getPhotos() { return photos; }
        public void setPhotos(List<PhotoDto> photos) { this.photos = photos; }
        public List<AnswerDto> getAnswers() { return answers; }
        public void setAnswers(List<AnswerDto> answers) { this.answers = answers; }
    }

    public static class PhotoDto {
        private Long id;
        private String photoType;
        private String direction;
        private String idSide;
        private Instant capturedAt;
        private String url;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getPhotoType() { return photoType; }
        public void setPhotoType(String photoType) { this.photoType = photoType; }
        public String getDirection() { return direction; }
        public void setDirection(String direction) { this.direction = direction; }
        public String getIdSide() { return idSide; }
        public void setIdSide(String idSide) { this.idSide = idSide; }
        public Instant getCapturedAt() { return capturedAt; }
        public void setCapturedAt(Instant capturedAt) { this.capturedAt = capturedAt; }
        public String getUrl() { return url; }
        public void setUrl(String url) { this.url = url; }
    }

    public static class AnswerDto {
        private Long questionId;
        private String questionText;
        private String topic;
        private String difficulty;
        private String selectedAnswer;
        private String correctAnswer;
        private boolean correct;
        private boolean flagged;

        public Long getQuestionId() { return questionId; }
        public void setQuestionId(Long questionId) { this.questionId = questionId; }
        public String getQuestionText() { return questionText; }
        public void setQuestionText(String questionText) { this.questionText = questionText; }
        public String getTopic() { return topic; }
        public void setTopic(String topic) { this.topic = topic; }
        public String getDifficulty() { return difficulty; }
        public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
        public String getSelectedAnswer() { return selectedAnswer; }
        public void setSelectedAnswer(String selectedAnswer) { this.selectedAnswer = selectedAnswer; }
        public String getCorrectAnswer() { return correctAnswer; }
        public void setCorrectAnswer(String correctAnswer) { this.correctAnswer = correctAnswer; }
        public boolean isCorrect() { return correct; }
        public void setCorrect(boolean correct) { this.correct = correct; }
        public boolean isFlagged() { return flagged; }
        public void setFlagged(boolean flagged) { this.flagged = flagged; }
    }

    public static class UpdateStatusRequest {
        private String status;
        private String reason;

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }

    public static class ProctorMessageRequest {
        private String message;

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

    public static class CreateAccessCodeRequest {
        private String code;
        private String candidateName;
        private String candidateEmail;
        private String examTitle;
        private String examCode;
        private Integer durationMinutes;
        private Integer questionCount;

        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        public String getCandidateName() { return candidateName; }
        public void setCandidateName(String candidateName) { this.candidateName = candidateName; }
        public String getCandidateEmail() { return candidateEmail; }
        public void setCandidateEmail(String candidateEmail) { this.candidateEmail = candidateEmail; }
        public String getExamTitle() { return examTitle; }
        public void setExamTitle(String examTitle) { this.examTitle = examTitle; }
        public String getExamCode() { return examCode; }
        public void setExamCode(String examCode) { this.examCode = examCode; }
        public Integer getDurationMinutes() { return durationMinutes; }
        public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
        public Integer getQuestionCount() { return questionCount; }
        public void setQuestionCount(Integer questionCount) { this.questionCount = questionCount; }
    }

    public static class CreateQuestionRequest {
        private String topic;
        private String difficulty;
        private String questionText;
        private String optionA;
        private String optionB;
        private String optionC;
        private String optionD;
        private String correctAnswer;
        private String explanation;

        public String getTopic() { return topic; }
        public void setTopic(String topic) { this.topic = topic; }
        public String getDifficulty() { return difficulty; }
        public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
        public String getQuestionText() { return questionText; }
        public void setQuestionText(String questionText) { this.questionText = questionText; }
        public String getOptionA() { return optionA; }
        public void setOptionA(String optionA) { this.optionA = optionA; }
        public String getOptionB() { return optionB; }
        public void setOptionB(String optionB) { this.optionB = optionB; }
        public String getOptionC() { return optionC; }
        public void setOptionC(String optionC) { this.optionC = optionC; }
        public String getOptionD() { return optionD; }
        public void setOptionD(String optionD) { this.optionD = optionD; }
        public String getCorrectAnswer() { return correctAnswer; }
        public void setCorrectAnswer(String correctAnswer) { this.correctAnswer = correctAnswer; }
        public String getExplanation() { return explanation; }
        public void setExplanation(String explanation) { this.explanation = explanation; }
    }

    public static class AdminStatsDto {
        private long totalSessions;
        private long inProgressSessions;
        private long completedSessions;
        private long flaggedSessions;
        private double averageScorePercent;
        private double passRatePercent;

        public long getTotalSessions() { return totalSessions; }
        public void setTotalSessions(long totalSessions) { this.totalSessions = totalSessions; }
        public long getInProgressSessions() { return inProgressSessions; }
        public void setInProgressSessions(long inProgressSessions) { this.inProgressSessions = inProgressSessions; }
        public long getCompletedSessions() { return completedSessions; }
        public void setCompletedSessions(long completedSessions) { this.completedSessions = completedSessions; }
        public long getFlaggedSessions() { return flaggedSessions; }
        public void setFlaggedSessions(long flaggedSessions) { this.flaggedSessions = flaggedSessions; }
        public double getAverageScorePercent() { return averageScorePercent; }
        public void setAverageScorePercent(double averageScorePercent) { this.averageScorePercent = averageScorePercent; }
        public double getPassRatePercent() { return passRatePercent; }
        public void setPassRatePercent(double passRatePercent) { this.passRatePercent = passRatePercent; }
    }

    public static class UpdateAccessCodeRequest {
        private String code;
        private String candidateName;
        private String candidateEmail;
        private String examTitle;
        private String examCode;
        private Integer durationMinutes;
        private Integer questionCount;

        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        public String getCandidateName() { return candidateName; }
        public void setCandidateName(String candidateName) { this.candidateName = candidateName; }
        public String getCandidateEmail() { return candidateEmail; }
        public void setCandidateEmail(String candidateEmail) { this.candidateEmail = candidateEmail; }
        public String getExamTitle() { return examTitle; }
        public void setExamTitle(String examTitle) { this.examTitle = examTitle; }
        public String getExamCode() { return examCode; }
        public void setExamCode(String examCode) { this.examCode = examCode; }
        public Integer getDurationMinutes() { return durationMinutes; }
        public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
        public Integer getQuestionCount() { return questionCount; }
        public void setQuestionCount(Integer questionCount) { this.questionCount = questionCount; }
    }

    public static class UpdateQuestionRequest {
        private String topic;
        private String difficulty;
        private String questionText;
        private String optionA;
        private String optionB;
        private String optionC;
        private String optionD;
        private String correctAnswer;
        private String explanation;

        public String getTopic() { return topic; }
        public void setTopic(String topic) { this.topic = topic; }
        public String getDifficulty() { return difficulty; }
        public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
        public String getQuestionText() { return questionText; }
        public void setQuestionText(String questionText) { this.questionText = questionText; }
        public String getOptionA() { return optionA; }
        public void setOptionA(String optionA) { this.optionA = optionA; }
        public String getOptionB() { return optionB; }
        public void setOptionB(String optionB) { this.optionB = optionB; }
        public String getOptionC() { return optionC; }
        public void setOptionC(String optionC) { this.optionC = optionC; }
        public String getOptionD() { return optionD; }
        public void setOptionD(String optionD) { this.optionD = optionD; }
        public String getCorrectAnswer() { return correctAnswer; }
        public void setCorrectAnswer(String correctAnswer) { this.correctAnswer = correctAnswer; }
        public String getExplanation() { return explanation; }
        public void setExplanation(String explanation) { this.explanation = explanation; }
    }

    public static class CreateUserRequest {
        private String email;
        private String password;
        private String fullName;
        private String role;
        private String phoneNumber;
        private String country;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
        public String getCountry() { return country; }
        public void setCountry(String country) { this.country = country; }
    }

    public static class UpdateUserRequest {
        private String fullName;
        private String role;
        private String phoneNumber;
        private String country;
        private Boolean active;

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
        public String getCountry() { return country; }
        public void setCountry(String country) { this.country = country; }
        public Boolean getActive() { return active; }
        public void setActive(Boolean active) { this.active = active; }
    }
}
