package com.yatricloud.proctor.controller;

import com.yatricloud.proctor.dto.SessionDTOs;
import com.yatricloud.proctor.service.SessionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/sessions")
@Tag(name = "Session Management", description = "OnVUE Exam Session & Check-in APIs")
@CrossOrigin(origins = "*")
public class SessionController {

    private static final Logger log = LoggerFactory.getLogger(SessionController.class);

    private final SessionService sessionService;

    public SessionController(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    @PostMapping("/validate-code")
    @Operation(summary = "Validate single-use access code and start session")
    public ResponseEntity<SessionDTOs.ValidateCodeResponse> validateCode(
            @RequestBody SessionDTOs.ValidateCodeRequest request) {
        log.info("Validating code: {}", request.getCode());
        return ResponseEntity.ok(sessionService.validateCode(request.getCode()));
    }

    @GetMapping("/{sessionId}")
    @Operation(summary = "Get full state of an exam session")
    public ResponseEntity<SessionDTOs.SessionStateResponse> getState(
            @PathVariable Long sessionId) {
        return ResponseEntity.ok(sessionService.getState(sessionId));
    }

    @PostMapping("/{sessionId}/equipment")
    @Operation(summary = "Record equipment diagnostics (Mic, Speaker, Webcam)")
    public ResponseEntity<SessionDTOs.SessionStateResponse> updateEquipment(
            @PathVariable Long sessionId,
            @RequestBody SessionDTOs.EquipmentCheckRequest request) {
        return ResponseEntity.ok(sessionService.updateEquipment(sessionId, request));
    }

    @GetMapping("/{sessionId}/mobile-token")
    @Operation(summary = "Generate/retrieve QR companion mobile pairing token")
    public ResponseEntity<SessionDTOs.MobileTokenResponse> getMobileToken(
            @PathVariable Long sessionId,
            @RequestParam(defaultValue = "http://localhost:5173") String baseUrl) {
        return ResponseEntity.ok(sessionService.getMobileToken(sessionId, baseUrl));
    }

    @PostMapping("/{sessionId}/terms")
    @Operation(summary = "Accept Microsoft / OnVUE Candidate Agreement and NDA")
    public ResponseEntity<Void> acceptTerms(@PathVariable Long sessionId) {
        sessionService.acceptTerms(sessionId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{sessionId}/system-check")
    @Operation(summary = "Record system and secure browser diagnostics")
    public ResponseEntity<Void> recordSystemCheck(
            @PathVariable Long sessionId,
            @RequestBody SessionDTOs.SystemCheckRequest request) {
        sessionService.recordSystemCheck(sessionId, request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{sessionId}/final-check")
    @Operation(summary = "Confirm final pre-exam face check")
    public ResponseEntity<Void> confirmFinalFace(@PathVariable Long sessionId) {
        sessionService.confirmFinalFace(sessionId);
        return ResponseEntity.ok().build();
    }
}
