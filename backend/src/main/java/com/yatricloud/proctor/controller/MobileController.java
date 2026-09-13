package com.yatricloud.proctor.controller;

import com.yatricloud.proctor.dto.SessionDTOs;
import com.yatricloud.proctor.model.ExamSession;
import com.yatricloud.proctor.repository.ExamSessionRepository;
import com.yatricloud.proctor.service.PhotoService;
import com.yatricloud.proctor.service.SessionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/mobile/{token}")
@Tag(name = "Mobile Companion", description = "Mobile Check-in, ID & Room Scan APIs")
@CrossOrigin(origins = "*")
public class MobileController {

    private static final Logger log = LoggerFactory.getLogger(MobileController.class);

    private final SessionService sessionService;
    private final PhotoService photoService;
    private final ExamSessionRepository sessionRepo;

    public MobileController(SessionService sessionService,
                            PhotoService photoService,
                            ExamSessionRepository sessionRepo) {
        this.sessionService = sessionService;
        this.photoService = photoService;
        this.sessionRepo = sessionRepo;
    }

    @GetMapping("/status")
    @Operation(summary = "Get mobile session status and candidate details")
    public ResponseEntity<Map<String, Object>> getMobileStatus(@PathVariable String token) {
        ExamSession s = sessionRepo.findByMobileToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid mobile token"));

        return ResponseEntity.ok(Map.of(
                "sessionId", s.getId(),
                "candidateName", s.getAccessCode().getCandidateName(),
                "examTitle", s.getAccessCode().getExamTitle(),
                "mobilePaired", s.isMobilePaired(),
                "personPhotoCaptured", s.isPersonPhotoCaptured(),
                "roomScansComplete", s.isRoomScansComplete(),
                "idVerified", s.isIdVerified()
        ));
    }

    @PostMapping("/pair")
    @Operation(summary = "Pair mobile companion device with desktop exam session")
    public ResponseEntity<Map<String, String>> completePairing(@PathVariable String token) {
        sessionService.completeMobilePairing(token);
        return ResponseEntity.ok(Map.of("status", "PAIRED", "message", "Mobile successfully paired with desktop session"));
    }

    @PostMapping("/id-selection")
    @Operation(summary = "Submit candidate ID issuing country and document type")
    public ResponseEntity<Void> updateIdSelection(
            @PathVariable String token,
            @RequestBody SessionDTOs.IdSelectionRequest request) {
        sessionService.updateIdSelection(token, request);
        return ResponseEntity.ok().build();
    }

    @PostMapping(value = "/photos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload verification photo (selfie, ID card, or 4-direction room scan)")
    public ResponseEntity<SessionDTOs.PhotoUploadResponse> uploadPhoto(
            @PathVariable String token,
            @RequestParam("photoType") String photoType,
            @RequestParam(value = "direction", required = false) String direction,
            @RequestParam(value = "idSide", required = false) String idSide,
            @RequestPart("file") MultipartFile file) throws IOException {

        ExamSession s = sessionRepo.findByMobileToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid mobile token"));

        return ResponseEntity.ok(photoService.upload(s.getId(), photoType, direction, idSide, file));
    }
}
