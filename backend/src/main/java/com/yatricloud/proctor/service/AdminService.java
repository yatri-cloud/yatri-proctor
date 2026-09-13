package com.yatricloud.proctor.service;

import com.yatricloud.proctor.dto.AdminDTOs;
import com.yatricloud.proctor.model.*;
import com.yatricloud.proctor.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
@Transactional
public class AdminService {

    private static final Logger log = LoggerFactory.getLogger(AdminService.class);

    private final ExamSessionRepository sessionRepo;
    private final AccessCodeRepository accessCodeRepo;
    private final PhotoRepository photoRepo;
    private final QuestionRepository questionRepo;
    private final SessionAnswerRepository answerRepo;
    private final SimpMessagingTemplate messagingTemplate;

    public AdminService(ExamSessionRepository sessionRepo,
                        AccessCodeRepository accessCodeRepo,
                        PhotoRepository photoRepo,
                        QuestionRepository questionRepo,
                        SessionAnswerRepository answerRepo,
                        SimpMessagingTemplate messagingTemplate) {
        this.sessionRepo = sessionRepo;
        this.accessCodeRepo = accessCodeRepo;
        this.photoRepo = photoRepo;
        this.questionRepo = questionRepo;
        this.answerRepo = answerRepo;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional(readOnly = true)
    public List<AdminDTOs.SessionSummaryDto> getAllSessions() {
        List<ExamSession> sessions = sessionRepo.findAll(Sort.by(Sort.Direction.DESC, "id"));
        return sessions.stream().map(this::toSummaryDto).toList();
    }

    @Transactional(readOnly = true)
    public AdminDTOs.SessionDetailDto getSessionDetail(Long id) {
        ExamSession s = sessionRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Session not found: " + id));

        AdminDTOs.SessionDetailDto detail = new AdminDTOs.SessionDetailDto();
        populateSummary(detail, s);

        // Photos
        List<Photo> photos = photoRepo.findBySessionId(id);
        detail.setPhotos(photos.stream().map(p -> {
            AdminDTOs.PhotoDto pd = new AdminDTOs.PhotoDto();
            pd.setId(p.getId());
            pd.setPhotoType(p.getPhotoType() != null ? p.getPhotoType().name() : "");
            pd.setDirection(p.getDirection());
            pd.setIdSide(p.getIdSide());
            pd.setCapturedAt(p.getCapturedAt());
            pd.setUrl("/api/v1/photos/" + p.getId());
            return pd;
        }).toList());

        // Answers
        List<SessionAnswer> answers = answerRepo.findBySessionId(id);
        detail.setAnswers(answers.stream().map(a -> {
            AdminDTOs.AnswerDto ad = new AdminDTOs.AnswerDto();
            ad.setQuestionId(a.getQuestion().getId());
            ad.setQuestionText(a.getQuestion().getQuestionText());
            ad.setTopic(a.getQuestion().getTopic());
            ad.setDifficulty(a.getQuestion().getDifficulty() != null ? a.getQuestion().getDifficulty().name() : "");
            ad.setSelectedAnswer(a.getSelectedAnswer());
            ad.setCorrectAnswer(a.getQuestion().getCorrectAnswer());
            ad.setCorrect(a.getSelectedAnswer() != null && a.getSelectedAnswer().equalsIgnoreCase(a.getQuestion().getCorrectAnswer()));
            ad.setFlagged(Boolean.TRUE.equals(a.getFlagged()));
            return ad;
        }).toList());

        return detail;
    }

    public void updateSessionStatus(Long id, String statusStr, String reason) {
        ExamSession s = sessionRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Session not found: " + id));

        ExamSession.SessionStatus newStatus = ExamSession.SessionStatus.valueOf(statusStr.toUpperCase());
        s.setStatus(newStatus);
        sessionRepo.save(s);

        log.info("Admin updated session {} status to {} (reason: {})", id, newStatus, reason);

        // Broadcast to client via WebSocket
        messagingTemplate.convertAndSend(
                "/topic/session/" + id,
                Map.of("event", "STATUS_CHANGE", "sessionId", id, "status", newStatus.name(), "reason", reason != null ? reason : "")
        );
    }

    public void sendProctorMessage(Long id, String message) {
        ExamSession s = sessionRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Session not found: " + id));

        log.info("Proctor sent message to session {}: {}", id, message);

        messagingTemplate.convertAndSend(
                "/topic/session/" + id,
                Map.of("event", "PROCTOR_MESSAGE", "sessionId", id, "message", message, "sentAt", Instant.now().toString())
        );
    }

    @Transactional(readOnly = true)
    public List<AccessCode> getAllAccessCodes() {
        return accessCodeRepo.findAll(Sort.by(Sort.Direction.DESC, "id"));
    }

    public AccessCode createAccessCode(AdminDTOs.CreateAccessCodeRequest req) {
        String code = (req.getCode() != null && !req.getCode().isBlank()) 
                ? req.getCode().trim() 
                : String.format("%03d-%03d-%03d", new Random().nextInt(900) + 100, new Random().nextInt(900) + 100, new Random().nextInt(900) + 100);

        AccessCode ac = AccessCode.builder()
                .code(code)
                .candidateName(req.getCandidateName() != null ? req.getCandidateName().trim() : "Candidate")
                .examTitle(req.getExamTitle() != null ? req.getExamTitle().trim() : "AWS Certified Solutions Architect – Associate")
                .examCode(req.getExamCode() != null ? req.getExamCode().trim() : "SAA-C03")
                .durationMinutes(req.getDurationMinutes() != null ? req.getDurationMinutes() : 65)
                .questionCount(req.getQuestionCount() != null ? req.getQuestionCount() : 20)
                .validUntil(Instant.now().plusSeconds(7L * 24 * 60 * 60))
                .build();

        return accessCodeRepo.save(ac);
    }

    @Transactional(readOnly = true)
    public List<Question> getAllQuestions() {
        return questionRepo.findAll(Sort.by(Sort.Direction.ASC, "id"));
    }

    public Question createQuestion(AdminDTOs.CreateQuestionRequest req) {
        Question q = Question.builder()
                .topic(req.getTopic() != null ? req.getTopic() : "Cloud Architecture")
                .difficulty(Question.Difficulty.valueOf(req.getDifficulty() != null ? req.getDifficulty().toUpperCase() : "MEDIUM"))
                .questionText(req.getQuestionText())
                .optionA(req.getOptionA())
                .optionB(req.getOptionB())
                .optionC(req.getOptionC())
                .optionD(req.getOptionD())
                .correctAnswer(req.getCorrectAnswer() != null ? req.getCorrectAnswer().toUpperCase() : "A")
                .explanation(req.getExplanation() != null ? req.getExplanation() : "")
                .build();

        return questionRepo.save(q);
    }

    @Transactional(readOnly = true)
    public AdminDTOs.AdminStatsDto getStats() {
        List<ExamSession> sessions = sessionRepo.findAll();
        AdminDTOs.AdminStatsDto stats = new AdminDTOs.AdminStatsDto();
        stats.setTotalSessions(sessions.size());

        long inProgress = sessions.stream().filter(s -> 
                s.getStatus() == ExamSession.SessionStatus.IN_PROGRESS ||
                s.getStatus() == ExamSession.SessionStatus.EQUIPMENT_CHECK ||
                s.getStatus() == ExamSession.SessionStatus.MOBILE_PAIRED).count();
        long completed = sessions.stream().filter(s -> s.getStatus() == ExamSession.SessionStatus.SUBMITTED).count();
        long flagged = sessions.stream().filter(s -> s.getStatus() == ExamSession.SessionStatus.FLAGGED).count();

        stats.setInProgressSessions(inProgress);
        stats.setCompletedSessions(completed);
        stats.setFlaggedSessions(flagged);

        OptionalDouble avgScore = sessions.stream()
                .filter(s -> s.getScorePercent() != null)
                .mapToInt(ExamSession::getScorePercent)
                .average();
        stats.setAverageScorePercent(avgScore.orElse(0.0));

        long passedCount = sessions.stream()
                .filter(s -> s.getScorePercent() != null && s.getScorePercent() >= 65)
                .count();
        long submittedCount = sessions.stream()
                .filter(s -> s.getScorePercent() != null)
                .count();
        stats.setPassRatePercent(submittedCount > 0 ? ((double) passedCount / submittedCount) * 100.0 : 0.0);

        return stats;
    }

    private AdminDTOs.SessionSummaryDto toSummaryDto(ExamSession s) {
        AdminDTOs.SessionSummaryDto dto = new AdminDTOs.SessionSummaryDto();
        populateSummary(dto, s);
        return dto;
    }

    private void populateSummary(AdminDTOs.SessionSummaryDto dto, ExamSession s) {
        dto.setId(s.getId());
        if (s.getAccessCode() != null) {
            dto.setAccessCode(s.getAccessCode().getCode());
            dto.setCandidateName(s.getAccessCode().getCandidateName());
            dto.setExamTitle(s.getAccessCode().getExamTitle());
            dto.setExamCode(s.getAccessCode().getExamCode());
        }
        dto.setStatus(s.getStatus() != null ? s.getStatus().name() : "");
        dto.setScorePercent(s.getScorePercent());
        dto.setSpeakerPass(s.getSpeakerPass());
        dto.setMicPass(s.getMicPass());
        dto.setWebcamPass(s.getWebcamPass());
        dto.setMobilePaired(s.getMobilePaired());
        dto.setPersonPhotoCaptured(s.getPersonPhotoCaptured());
        dto.setRoomScansComplete(s.getRoomScansComplete());
        dto.setIdVerified(s.getIdVerified());
        dto.setTermsAccepted(s.getTermsAccepted());
        dto.setSystemCheckPassed(s.getSystemCheckPassed());
        dto.setNetworkMbps(s.getNetworkMbps());
        dto.setTimeRemainingSeconds(s.getTimeRemainingSeconds());
        dto.setCreatedAt(s.getCreatedAt());
        dto.setPhotoCount(s.getPhotos() != null ? s.getPhotos().size() : 0);
    }
}
