package com.yatricloud.proctor.controller;

import com.yatricloud.proctor.dto.AdminDTOs;
import com.yatricloud.proctor.model.AccessCode;
import com.yatricloud.proctor.model.Question;
import com.yatricloud.proctor.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@Tag(name = "Proctor Admin", description = "Admin & Proctoring Management APIs")
@CrossOrigin(origins = "*")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/sessions")
    @Operation(summary = "Get all exam sessions")
    public ResponseEntity<List<AdminDTOs.SessionSummaryDto>> getSessions() {
        return ResponseEntity.ok(adminService.getAllSessions());
    }

    @GetMapping("/sessions/{id}")
    @Operation(summary = "Get full details of an exam session with photos and answers")
    public ResponseEntity<AdminDTOs.SessionDetailDto> getSessionDetail(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getSessionDetail(id));
    }

    @PostMapping("/sessions/{id}/status")
    @Operation(summary = "Update session status (FLAGGED, TERMINATED, etc.)")
    public ResponseEntity<Map<String, String>> updateStatus(
            @PathVariable Long id,
            @RequestBody AdminDTOs.UpdateStatusRequest request) {
        adminService.updateSessionStatus(id, request.getStatus(), request.getReason());
        return ResponseEntity.ok(Map.of("status", "SUCCESS", "newStatus", request.getStatus()));
    }

    @PostMapping("/sessions/{id}/message")
    @Operation(summary = "Send proctor live broadcast message to candidate session")
    public ResponseEntity<Map<String, String>> sendMessage(
            @PathVariable Long id,
            @RequestBody AdminDTOs.ProctorMessageRequest request) {
        adminService.sendProctorMessage(id, request.getMessage());
        return ResponseEntity.ok(Map.of("status", "SENT"));
    }

    @DeleteMapping("/sessions/{id}")
    @Operation(summary = "Delete an exam session")
    public ResponseEntity<Map<String, String>> deleteSession(@PathVariable Long id) {
        adminService.deleteSession(id);
        return ResponseEntity.ok(Map.of("status", "DELETED", "id", String.valueOf(id)));
    }

    @GetMapping("/access-codes")
    @Operation(summary = "List all candidate access codes")
    public ResponseEntity<List<AccessCode>> getAccessCodes() {
        return ResponseEntity.ok(adminService.getAllAccessCodes());
    }

    @PostMapping("/access-codes")
    @Operation(summary = "Generate new candidate access code")
    public ResponseEntity<AccessCode> createAccessCode(@RequestBody AdminDTOs.CreateAccessCodeRequest request) {
        return ResponseEntity.ok(adminService.createAccessCode(request));
    }

    @PutMapping("/access-codes/{id}")
    @Operation(summary = "Update an existing candidate access code")
    public ResponseEntity<AccessCode> updateAccessCode(
            @PathVariable Long id,
            @RequestBody AdminDTOs.UpdateAccessCodeRequest request) {
        return ResponseEntity.ok(adminService.updateAccessCode(id, request));
    }

    @DeleteMapping("/access-codes/{id}")
    @Operation(summary = "Delete/revoke a candidate access code")
    public ResponseEntity<Map<String, String>> deleteAccessCode(@PathVariable Long id) {
        adminService.deleteAccessCode(id);
        return ResponseEntity.ok(Map.of("status", "DELETED", "id", String.valueOf(id)));
    }

    @GetMapping("/questions")
    @Operation(summary = "List all questions in question bank")
    public ResponseEntity<List<Question>> getQuestions() {
        return ResponseEntity.ok(adminService.getAllQuestions());
    }

    @PostMapping("/questions")
    @Operation(summary = "Add a question to the question bank")
    public ResponseEntity<Question> createQuestion(@RequestBody AdminDTOs.CreateQuestionRequest request) {
        return ResponseEntity.ok(adminService.createQuestion(request));
    }

    @PutMapping("/questions/{id}")
    @Operation(summary = "Update a question in the question bank")
    public ResponseEntity<Question> updateQuestion(
            @PathVariable Long id,
            @RequestBody AdminDTOs.UpdateQuestionRequest request) {
        return ResponseEntity.ok(adminService.updateQuestion(id, request));
    }

    @DeleteMapping("/questions/{id}")
    @Operation(summary = "Delete a question from the question bank")
    public ResponseEntity<Map<String, String>> deleteQuestion(@PathVariable Long id) {
        adminService.deleteQuestion(id);
        return ResponseEntity.ok(Map.of("status", "DELETED", "id", String.valueOf(id)));
    }

    // ── User Management ──────────────────────────────────────────────────

    @GetMapping("/users")
    @Operation(summary = "List all registered users and candidates")
    public ResponseEntity<List<com.yatricloud.proctor.dto.AuthDTOs.UserProfileDto>> getUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PostMapping("/users")
    @Operation(summary = "Create a new user/candidate account")
    public ResponseEntity<com.yatricloud.proctor.dto.AuthDTOs.UserProfileDto> createUser(
            @RequestBody AdminDTOs.CreateUserRequest request) {
        return ResponseEntity.ok(adminService.createUser(request));
    }

    @PutMapping("/users/{id}")
    @Operation(summary = "Update user details or role")
    public ResponseEntity<com.yatricloud.proctor.dto.AuthDTOs.UserProfileDto> updateUser(
            @PathVariable Long id,
            @RequestBody AdminDTOs.UpdateUserRequest request) {
        return ResponseEntity.ok(adminService.updateUser(id, request));
    }

    @DeleteMapping("/users/{id}")
    @Operation(summary = "Delete a user account")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok(Map.of("status", "DELETED", "id", String.valueOf(id)));
    }

    @GetMapping("/stats")
    @Operation(summary = "Get proctoring platform statistics")
    public ResponseEntity<AdminDTOs.AdminStatsDto> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }
}
