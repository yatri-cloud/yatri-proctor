package com.yatricloud.proctor.controller;

import com.yatricloud.proctor.dto.QuestionDto;
import com.yatricloud.proctor.dto.ResultsResponse;
import com.yatricloud.proctor.dto.SessionDTOs;
import com.yatricloud.proctor.service.SessionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sessions/{sessionId}")
@Tag(name = "Exam Delivery Engine", description = "Test Delivery, Questions, Answers and Scoring")
@CrossOrigin(origins = "*")
public class ExamController {

    private static final Logger log = LoggerFactory.getLogger(ExamController.class);

    private final SessionService sessionService;

    public ExamController(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    @GetMapping("/questions")
    @Operation(summary = "Get shuffled exam questions for session")
    public ResponseEntity<List<QuestionDto>> getQuestions(@PathVariable Long sessionId) {
        return ResponseEntity.ok(sessionService.getQuestions(sessionId));
    }

    @PostMapping("/answers")
    @Operation(summary = "Save or update candidate response for a question")
    public ResponseEntity<Void> saveAnswer(
            @PathVariable Long sessionId,
            @RequestBody SessionDTOs.AnswerRequest request) {
        sessionService.saveAnswer(sessionId, request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/submit")
    @Operation(summary = "Submit completed exam and compute score & topic breakdown")
    public ResponseEntity<ResultsResponse> submitExam(
            @PathVariable Long sessionId,
            @RequestBody(required = false) SessionDTOs.SubmitExamRequest request) {
        Integer remainingSeconds = (request != null) ? request.getTimeRemainingSeconds() : null;
        return ResponseEntity.ok(sessionService.submitExam(sessionId, remainingSeconds));
    }

    @GetMapping("/results")
    @Operation(summary = "Retrieve final exam results, score, and pass/fail status")
    public ResponseEntity<ResultsResponse> getResults(@PathVariable Long sessionId) {
        return ResponseEntity.ok(sessionService.getResults(sessionId));
    }
}
