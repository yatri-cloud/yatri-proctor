package com.yatricloud.proctor.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yatricloud.proctor.dto.*;
import com.yatricloud.proctor.model.*;
import com.yatricloud.proctor.repository.*;
import com.yatricloud.proctor.security.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
@Transactional
public class SessionService {

    private static final Logger log = LoggerFactory.getLogger(SessionService.class);

    private final AccessCodeRepository accessCodeRepo;
    private final ExamSessionRepository sessionRepo;
    private final QuestionRepository questionRepo;
    private final SessionAnswerRepository answerRepo;
    private final JwtTokenProvider jwtTokenProvider;
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    public SessionService(AccessCodeRepository accessCodeRepo,
                          ExamSessionRepository sessionRepo,
                          QuestionRepository questionRepo,
                          SessionAnswerRepository answerRepo,
                          JwtTokenProvider jwtTokenProvider,
                          SimpMessagingTemplate messagingTemplate,
                          ObjectMapper objectMapper) {
        this.accessCodeRepo = accessCodeRepo;
        this.sessionRepo = sessionRepo;
        this.questionRepo = questionRepo;
        this.answerRepo = answerRepo;
        this.jwtTokenProvider = jwtTokenProvider;
        this.messagingTemplate = messagingTemplate;
        this.objectMapper = objectMapper;
    }

    // ── 1. Validate access code → create session ──────────────────────────

    public SessionDTOs.ValidateCodeResponse validateCode(String code) {
        String raw = code != null ? code.trim() : "";
        String clean = raw.replace("-", "");
        String formatted = clean.length() == 9 ? clean.substring(0, 3) + "-" + clean.substring(3, 6) + "-" + clean.substring(6) : clean;

        AccessCode ac = accessCodeRepo.findByCode(raw)
                .or(() -> accessCodeRepo.findByCode(clean))
                .or(() -> accessCodeRepo.findByCode(formatted))
                .orElseThrow(() -> new IllegalArgumentException("Invalid access code: " + code));

        if (ac.isExpired())
            throw new IllegalStateException("Access code has expired");

        String sessionToken = UUID.randomUUID().toString();
        String mobileToken  = UUID.randomUUID().toString().replace("-", "").substring(0, 16);

        ExamSession session = ExamSession.builder()
                .accessCode(ac)
                .sessionToken(sessionToken)
                .mobileToken(mobileToken)
                .status(ExamSession.SessionStatus.CREATED)
                .timeRemainingSeconds(ac.getDurationMinutes() * 60)
                .build();

        session = sessionRepo.save(session);

        String jwt = jwtTokenProvider.generateToken(session.getId(), ac.getCandidateName());

        var resp = new SessionDTOs.ValidateCodeResponse();
        resp.setSessionId(session.getId());
        resp.setSessionToken(sessionToken);
        resp.setJwt(jwt);
        resp.setCandidateName(ac.getCandidateName());
        resp.setExamTitle(ac.getExamTitle());
        resp.setExamCode(ac.getExamCode());
        resp.setDurationMinutes(ac.getDurationMinutes());
        resp.setQuestionCount(ac.getQuestionCount());
        return resp;
    }

    // ── 2. Get session state ──────────────────────────────────────────────

    @Transactional(readOnly = true)
    public SessionDTOs.SessionStateResponse getState(Long sessionId) {
        ExamSession s = findSession(sessionId);
        return toStateResponse(s);
    }

    // ── 3. Equipment check ────────────────────────────────────────────────

    public SessionDTOs.SessionStateResponse updateEquipment(Long sessionId,
                                                             SessionDTOs.EquipmentCheckRequest req) {
        ExamSession s = findSession(sessionId);
        s.setSpeakerPass(req.getSpeakerPass());
        s.setMicPass(req.getMicPass());
        s.setWebcamPass(req.getWebcamPass());
        s.setStatus(ExamSession.SessionStatus.EQUIPMENT_CHECK);
        return toStateResponse(sessionRepo.save(s));
    }

    // ── 4. Generate mobile token ──────────────────────────────────────────

    public SessionDTOs.MobileTokenResponse getMobileToken(Long sessionId, String baseUrl) {
        ExamSession s = findSession(sessionId);
        var resp = new SessionDTOs.MobileTokenResponse();
        resp.setMobileToken(s.getMobileToken());
        resp.setMobileUrl(baseUrl + "/mobile/" + s.getMobileToken());
        resp.setExpiresInSeconds(300L);
        return resp;
    }

    // ── 5. Mobile pairing (called by mobile flow) ─────────────────────────

    public void completeMobilePairing(String mobileToken) {
        ExamSession s = sessionRepo.findByMobileToken(mobileToken)
                .orElseThrow(() -> new IllegalArgumentException("Invalid mobile token"));
        s.setMobilePaired(true);
        s.setPersonPhotoCaptured(true);
        s.setRoomScansComplete(true);
        s.setIdVerified(true);
        s.setStatus(ExamSession.SessionStatus.MOBILE_PAIRED);
        sessionRepo.save(s);

        // Push WebSocket event to desktop
        messagingTemplate.convertAndSend(
                "/topic/session/" + s.getId(),
                Map.of("event", "MOBILE_PAIRED", "sessionId", s.getId()));

        log.info("Mobile paired for session {}", s.getId());
    }

    // ── 6. ID selection ───────────────────────────────────────────────────

    public void updateIdSelection(String mobileToken, SessionDTOs.IdSelectionRequest req) {
        ExamSession s = sessionRepo.findByMobileToken(mobileToken)
                .orElseThrow(() -> new IllegalArgumentException("Invalid mobile token"));
        s.setIdCountry(req.getCountry());
        s.setIdType(req.getIdType());
        sessionRepo.save(s);
    }

    // ── 7. Terms acceptance ───────────────────────────────────────────────

    public void acceptTerms(Long sessionId) {
        ExamSession s = findSession(sessionId);
        s.setTermsAccepted(true);
        s.setTermsAcceptedAt(Instant.now());
        s.setStatus(ExamSession.SessionStatus.TERMS_ACCEPTED);
        sessionRepo.save(s);
    }

    // ── 8. System check ───────────────────────────────────────────────────

    public void recordSystemCheck(Long sessionId, SessionDTOs.SystemCheckRequest req) {
        ExamSession s = findSession(sessionId);
        s.setNetworkMbps(req.getNetworkMbps());
        s.setScreenCount(req.getScreenCount());
        boolean passed = req.getNetworkMbps() >= 3.0 && req.getScreenCount() <= 1;
        s.setSystemCheckPassed(passed);
        s.setStatus(ExamSession.SessionStatus.SYSTEM_CHECK_DONE);
        sessionRepo.save(s);
    }

    // ── 9. Final face confirmation ────────────────────────────────────────

    public void confirmFinalFace(Long sessionId) {
        ExamSession s = findSession(sessionId);
        s.setFinalFaceConfirmed(true);
        sessionRepo.save(s);
    }

    // ── 10. Get shuffled questions ────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<QuestionDto> getQuestions(Long sessionId) {
        findSession(sessionId); // ensure session exists + auth
        List<Question> questions = questionRepo.findAllShuffled();
        return questions.stream().map(this::toQuestionDto).toList();
    }

    // ── 11. Save answer ───────────────────────────────────────────────────

    public void saveAnswer(Long sessionId, SessionDTOs.AnswerRequest req) {
        ExamSession s = findSession(sessionId);
        if (s.getStatus() == ExamSession.SessionStatus.SUBMITTED)
            throw new IllegalStateException("Exam already submitted");

        s.setStatus(ExamSession.SessionStatus.IN_PROGRESS);

        Question q = questionRepo.findById(req.getQuestionId())
                .orElseThrow(() -> new IllegalArgumentException("Question not found"));

        Optional<SessionAnswer> existing = answerRepo.findBySessionIdAndQuestionId(sessionId, q.getId());
        if (existing.isPresent()) {
            existing.get().setSelectedAnswer(req.getSelectedAnswer());
            existing.get().setFlagged(Boolean.TRUE.equals(req.getFlagged()));
            answerRepo.save(existing.get());
        } else {
            answerRepo.save(SessionAnswer.builder()
                    .session(s)
                    .question(q)
                    .selectedAnswer(req.getSelectedAnswer())
                    .flagged(Boolean.TRUE.equals(req.getFlagged()))
                    .build());
        }
        sessionRepo.save(s);
    }

    // ── 12. Submit exam ───────────────────────────────────────────────────

    public ResultsResponse submitExam(Long sessionId, Integer timeRemainingSeconds) {
        ExamSession s = findSession(sessionId);
        if (s.getStatus() == ExamSession.SessionStatus.SUBMITTED)
            throw new IllegalStateException("Exam already submitted");

        List<SessionAnswer> answers = answerRepo.findBySessionId(sessionId);
        List<Question> allQuestions = questionRepo.findAllShuffled(); // or findAll

        // Score computation
        Map<String, ResultsResponse.TopicScore> topicMap = new LinkedHashMap<>();
        int correct = 0;

        for (Question q : allQuestions) {
            topicMap.computeIfAbsent(q.getTopic(), t -> {
                ResultsResponse.TopicScore ts = new ResultsResponse.TopicScore();
                ts.setTotal(0); ts.setCorrect(0);
                return ts;
            });
            topicMap.get(q.getTopic()).setTotal(topicMap.get(q.getTopic()).getTotal() + 1);

            Optional<SessionAnswer> ans = answers.stream()
                    .filter(a -> a.getQuestion().getId().equals(q.getId())).findFirst();
            if (ans.isPresent() && ans.get().getSelectedAnswer().equals(q.getCorrectAnswer())) {
                correct++;
                topicMap.get(q.getTopic()).setCorrect(topicMap.get(q.getTopic()).getCorrect() + 1);
            }
        }

        // Compute percent for each topic
        topicMap.forEach((topic, ts) ->
                ts.setPercent(ts.getTotal() > 0 ? (int) Math.round((double) ts.getCorrect() / ts.getTotal() * 100) : 0));

        int scorePercent = allQuestions.isEmpty() ? 0 : (int) Math.round((double) correct / allQuestions.size() * 100);

        // Persist
        s.setStatus(ExamSession.SessionStatus.SUBMITTED);
        s.setSubmittedAt(Instant.now());
        s.setScorePercent(scorePercent);
        if (timeRemainingSeconds != null) s.setTimeRemainingSeconds(timeRemainingSeconds);

        try {
            s.setTopicBreakdownJson(objectMapper.writeValueAsString(topicMap));
        } catch (JsonProcessingException e) {
            log.warn("Failed to serialize topic breakdown", e);
        }
        sessionRepo.save(s);

        return buildResultsResponse(s, allQuestions, answers, topicMap, scorePercent, correct);
    }

    // ── 13. Get results ───────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public ResultsResponse getResults(Long sessionId) {
        ExamSession s = findSession(sessionId);
        if (s.getStatus() != ExamSession.SessionStatus.SUBMITTED)
            throw new IllegalStateException("Exam not yet submitted");

        List<SessionAnswer> answers = answerRepo.findBySessionId(sessionId);
        List<Question> allQuestions = questionRepo.findAll();

        Map<String, ResultsResponse.TopicScore> topicMap;
        try {
            topicMap = objectMapper.readValue(s.getTopicBreakdownJson(),
                    objectMapper.getTypeFactory().constructMapType(
                            LinkedHashMap.class, String.class, ResultsResponse.TopicScore.class));
        } catch (Exception e) {
            topicMap = new LinkedHashMap<>();
        }

        int correct = (int) answers.stream()
                .filter(a -> a.getSelectedAnswer().equals(a.getQuestion().getCorrectAnswer())).count();

        return buildResultsResponse(s, allQuestions, answers, topicMap, s.getScorePercent(), correct);
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    private ExamSession findSession(Long id) {
        return sessionRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Session not found: " + id));
    }

    private SessionDTOs.SessionStateResponse toStateResponse(ExamSession s) {
        var r = new SessionDTOs.SessionStateResponse();
        r.setSessionId(s.getId());
        r.setStatus(s.getStatus().name());
        r.setSpeakerPass(s.getSpeakerPass());
        r.setMicPass(s.getMicPass());
        r.setWebcamPass(s.getWebcamPass());
        r.setMobilePaired(s.getMobilePaired());
        r.setMobileToken(s.getMobileToken());
        r.setPersonPhotoCaptured(s.getPersonPhotoCaptured());
        r.setRoomScansComplete(s.getRoomScansComplete());
        r.setIdVerified(s.getIdVerified());
        r.setTermsAccepted(s.getTermsAccepted());
        r.setSystemCheckPassed(s.getSystemCheckPassed());
        r.setFinalFaceConfirmed(s.getFinalFaceConfirmed());
        r.setTimeRemainingSeconds(s.getTimeRemainingSeconds());
        r.setScorePercent(s.getScorePercent());
        r.setCandidateName(s.getAccessCode().getCandidateName());
        r.setExamTitle(s.getAccessCode().getExamTitle());
        return r;
    }

    private QuestionDto toQuestionDto(Question q) {
        QuestionDto dto = new QuestionDto();
        dto.setId(q.getId());
        dto.setTopic(q.getTopic());
        dto.setDifficulty(q.getDifficulty().name());
        dto.setQuestionText(q.getQuestionText());
        dto.setOptions(List.of(
                option("A", q.getOptionA()),
                option("B", q.getOptionB()),
                option("C", q.getOptionC()),
                option("D", q.getOptionD())
        ));
        return dto;
    }

    private QuestionDto.Option option(String key, String text) {
        QuestionDto.Option o = new QuestionDto.Option();
        o.setKey(key);
        o.setText(text);
        return o;
    }

    private ResultsResponse buildResultsResponse(ExamSession s, List<Question> allQuestions,
                                                  List<SessionAnswer> answers,
                                                  Map<String, ResultsResponse.TopicScore> topicMap,
                                                  int scorePercent, int correct) {
        ResultsResponse r = new ResultsResponse();
        r.setSessionId(s.getId());
        r.setCandidateName(s.getAccessCode().getCandidateName());
        r.setExamTitle(s.getAccessCode().getExamTitle());
        r.setScorePercent(scorePercent);
        r.setPassed(scorePercent >= 65);
        r.setCorrectCount(correct);
        r.setTotalCount(allQuestions.size());
        r.setTopicBreakdown(topicMap);

        List<ResultsResponse.QuestionResult> qrs = allQuestions.stream().map(q -> {
            ResultsResponse.QuestionResult qr = new ResultsResponse.QuestionResult();
            qr.setQuestionId(q.getId());
            qr.setTopic(q.getTopic());
            qr.setDifficulty(q.getDifficulty().name());
            qr.setQuestionText(q.getQuestionText());
            qr.setOptionA(q.getOptionA());
            qr.setOptionB(q.getOptionB());
            qr.setOptionC(q.getOptionC());
            qr.setOptionD(q.getOptionD());
            qr.setCorrectAnswer(q.getCorrectAnswer());
            qr.setExplanation(q.getExplanation());
            answers.stream()
                    .filter(a -> a.getQuestion().getId().equals(q.getId()))
                    .findFirst()
                    .ifPresent(a -> {
                        qr.setSelectedAnswer(a.getSelectedAnswer());
                        qr.setIsCorrect(a.getSelectedAnswer().equals(q.getCorrectAnswer()));
                    });
            return qr;
        }).toList();
        r.setQuestions(qrs);
        return r;
    }
}
