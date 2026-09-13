package com.yatricloud.proctor.service;

import com.yatricloud.proctor.dto.AdminDTOs;
import com.yatricloud.proctor.dto.AuthDTOs;
import com.yatricloud.proctor.model.*;
import com.yatricloud.proctor.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
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
    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final SimpMessagingTemplate messagingTemplate;

    public AdminService(ExamSessionRepository sessionRepo,
                        AccessCodeRepository accessCodeRepo,
                        PhotoRepository photoRepo,
                        QuestionRepository questionRepo,
                        SessionAnswerRepository answerRepo,
                        UserRepository userRepo,
                        PasswordEncoder passwordEncoder,
                        SimpMessagingTemplate messagingTemplate) {
        this.sessionRepo = sessionRepo;
        this.accessCodeRepo = accessCodeRepo;
        this.photoRepo = photoRepo;
        this.questionRepo = questionRepo;
        this.answerRepo = answerRepo;
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.messagingTemplate = messagingTemplate;
    }

    // ── Session Management ────────────────────────────────────────────────

    public void deleteSession(Long id) {
        ExamSession s = sessionRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Session not found: " + id));
        sessionRepo.delete(s);
        log.info("Deleted session {}", id);
    }

    // ── Access Code CRUD ──────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<AccessCode> getAllAccessCodes() {
        return accessCodeRepo.findAll(Sort.by(Sort.Direction.DESC, "id"));
    }

    public AccessCode createAccessCode(AdminDTOs.CreateAccessCodeRequest req) {
        String code = (req.getCode() != null && !req.getCode().isBlank()) 
                ? req.getCode().trim() 
                : String.format("%03d-%03d-%03d", new Random().nextInt(900) + 100, new Random().nextInt(900) + 100, new Random().nextInt(900) + 100);

        AccessCode ac = new AccessCode();
        ac.setCode(code);
        ac.setCandidateName(req.getCandidateName() != null ? req.getCandidateName().trim() : "Candidate");
        ac.setExamTitle(req.getExamTitle() != null ? req.getExamTitle().trim() : "AWS Certified Solutions Architect – Associate");
        ac.setExamCode(req.getExamCode() != null ? req.getExamCode().trim() : "SAA-C03");
        ac.setDurationMinutes(req.getDurationMinutes() != null ? req.getDurationMinutes() : 65);
        ac.setQuestionCount(req.getQuestionCount() != null ? req.getQuestionCount() : 20);
        ac.setValidUntil(Instant.now().plusSeconds(30L * 24 * 60 * 60));

        return accessCodeRepo.save(ac);
    }

    public AccessCode updateAccessCode(Long id, AdminDTOs.UpdateAccessCodeRequest req) {
        AccessCode ac = accessCodeRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Access code not found: " + id));

        if (req.getCode() != null && !req.getCode().isBlank()) ac.setCode(req.getCode().trim());
        if (req.getCandidateName() != null) ac.setCandidateName(req.getCandidateName().trim());
        if (req.getExamTitle() != null) ac.setExamTitle(req.getExamTitle().trim());
        if (req.getExamCode() != null) ac.setExamCode(req.getExamCode().trim());
        if (req.getDurationMinutes() != null) ac.setDurationMinutes(req.getDurationMinutes());
        if (req.getQuestionCount() != null) ac.setQuestionCount(req.getQuestionCount());

        return accessCodeRepo.save(ac);
    }

    public void deleteAccessCode(Long id) {
        AccessCode ac = accessCodeRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Access code not found: " + id));
        accessCodeRepo.delete(ac);
        log.info("Deleted access code {}", id);
    }

    // ── Question Bank CRUD ────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<Question> getAllQuestions() {
        return questionRepo.findAll(Sort.by(Sort.Direction.ASC, "id"));
    }

    public Question createQuestion(AdminDTOs.CreateQuestionRequest req) {
        Question q = new Question();
        q.setTopic(req.getTopic() != null ? req.getTopic() : "Cloud Architecture");
        q.setDifficulty(Question.Difficulty.valueOf(req.getDifficulty() != null ? req.getDifficulty().toUpperCase() : "MEDIUM"));
        q.setQuestionText(req.getQuestionText());
        q.setOptionA(req.getOptionA());
        q.setOptionB(req.getOptionB());
        q.setOptionC(req.getOptionC());
        q.setOptionD(req.getOptionD());
        q.setCorrectAnswer(req.getCorrectAnswer() != null ? req.getCorrectAnswer().toUpperCase() : "A");
        q.setExplanation(req.getExplanation() != null ? req.getExplanation() : "");

        return questionRepo.save(q);
    }

    public Question updateQuestion(Long id, AdminDTOs.UpdateQuestionRequest req) {
        Question q = questionRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Question not found: " + id));

        if (req.getTopic() != null) q.setTopic(req.getTopic());
        if (req.getDifficulty() != null) q.setDifficulty(Question.Difficulty.valueOf(req.getDifficulty().toUpperCase()));
        if (req.getQuestionText() != null) q.setQuestionText(req.getQuestionText());
        if (req.getOptionA() != null) q.setOptionA(req.getOptionA());
        if (req.getOptionB() != null) q.setOptionB(req.getOptionB());
        if (req.getOptionC() != null) q.setOptionC(req.getOptionC());
        if (req.getOptionD() != null) q.setOptionD(req.getOptionD());
        if (req.getCorrectAnswer() != null) q.setCorrectAnswer(req.getCorrectAnswer().toUpperCase());
        if (req.getExplanation() != null) q.setExplanation(req.getExplanation());

        return questionRepo.save(q);
    }

    public void deleteQuestion(Long id) {
        Question q = questionRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Question not found: " + id));
        questionRepo.delete(q);
        log.info("Deleted question {}", id);
    }

    // ── User Management CRUD ──────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<AuthDTOs.UserProfileDto> getAllUsers() {
        return userRepo.findAll(Sort.by(Sort.Direction.DESC, "id")).stream()
                .map(AuthDTOs.UserProfileDto::fromEntity)
                .toList();
    }

    public AuthDTOs.UserProfileDto createUser(AdminDTOs.CreateUserRequest req) {
        if (req.getEmail() == null || req.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        String email = req.getEmail().trim().toLowerCase();
        if (userRepo.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("User with email " + email + " already exists");
        }

        User.Role role = User.Role.ROLE_USER;
        if (req.getRole() != null) {
            try {
                role = User.Role.valueOf(req.getRole().toUpperCase().startsWith("ROLE_") ? req.getRole().toUpperCase() : "ROLE_" + req.getRole().toUpperCase());
            } catch (Exception ignored) {}
        }

        User u = new User();
        u.setEmail(email);
        u.setPasswordHash(passwordEncoder.encode(req.getPassword() != null && !req.getPassword().isBlank() ? req.getPassword() : "Default@123"));
        u.setFullName(req.getFullName() != null ? req.getFullName().trim() : email);
        u.setRole(role);
        u.setPhoneNumber(req.getPhoneNumber());
        u.setCountry(req.getCountry());
        u.setActive(true);

        return AuthDTOs.UserProfileDto.fromEntity(userRepo.save(u));
    }

    public AuthDTOs.UserProfileDto updateUser(Long id, AdminDTOs.UpdateUserRequest req) {
        User u = userRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));

        if (req.getFullName() != null) u.setFullName(req.getFullName().trim());
        if (req.getPhoneNumber() != null) u.setPhoneNumber(req.getPhoneNumber());
        if (req.getCountry() != null) u.setCountry(req.getCountry());
        if (req.getActive() != null) u.setActive(req.getActive());
        if (req.getRole() != null) {
            try {
                String roleStr = req.getRole().toUpperCase().startsWith("ROLE_") ? req.getRole().toUpperCase() : "ROLE_" + req.getRole().toUpperCase();
                u.setRole(User.Role.valueOf(roleStr));
            } catch (Exception ignored) {}
        }

        return AuthDTOs.UserProfileDto.fromEntity(userRepo.save(u));
    }

    public void deleteUser(Long id) {
        User u = userRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
        userRepo.delete(u);
        log.info("Deleted user {}", id);
    }

    // ── Session Queries & Actions ─────────────────────────────────────────

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

    public ExamSession updateSessionStatus(Long id, String statusStr, String reason) {
        ExamSession s = sessionRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Session not found: " + id));
        if (statusStr != null) {
            try {
                s.setStatus(ExamSession.SessionStatus.valueOf(statusStr.toUpperCase()));
            } catch (Exception e) {
                log.warn("Invalid session status: {}", statusStr);
            }
        }
        messagingTemplate.convertAndSend(
                "/topic/session/" + id,
                Map.of("event", "SESSION_STATUS_CHANGED", "sessionId", id, "status", s.getStatus().name(), "reason", reason != null ? reason : "")
        );
        return sessionRepo.save(s);
    }

    public ExamSession flagSession(Long id, String reason) {
        ExamSession s = sessionRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Session not found: " + id));
        s.setStatus(ExamSession.SessionStatus.FLAGGED);
        log.warn("Admin flagged session {}: {}", id, reason);

        messagingTemplate.convertAndSend(
                "/topic/session/" + id,
                Map.of("event", "SESSION_FLAGGED", "sessionId", id, "reason", reason != null ? reason : "Proctor flagged this session")
        );

        return sessionRepo.save(s);
    }

    public ExamSession terminateSession(Long id, String reason) {
        ExamSession s = sessionRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Session not found: " + id));
        s.setStatus(ExamSession.SessionStatus.TERMINATED);
        log.warn("Admin terminated session {}: {}", id, reason);

        messagingTemplate.convertAndSend(
                "/topic/session/" + id,
                Map.of("event", "SESSION_TERMINATED", "sessionId", id, "reason", reason != null ? reason : "Session terminated by proctor")
        );

        return sessionRepo.save(s);
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
