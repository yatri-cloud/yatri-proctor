package com.yatricloud.proctor.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.*;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/v1/sessions/diagnostics")
@Tag(name = "System Diagnostics", description = "Real hardware, process inspection, and secure browser checks")
@CrossOrigin(origins = "*")
public class DiagnosticController {

    private static final Logger log = LoggerFactory.getLogger(DiagnosticController.class);

    private static final List<String> PROHIBITED_KEYWORDS = List.of(
            "discord", "slack", "teams", "zoom", "anydesk", "teamviewer",
            "skype", "telegram", "whatsapp", "obs", "screenflow", "camtasia",
            "tightvnc", "remotedesktop", "wireguard"
    );

    public record ProhibitedAppDto(String id, String name, long pid, boolean closed) {}

    public record DiagnosticCheckResponse(
            String os,
            List<ProhibitedAppDto> prohibitedApps,
            int totalProcessesScanned,
            boolean passed
    ) {}

    public record KillRequest(Long pid, String name) {}

    @GetMapping("/system-processes")
    @Operation(summary = "Real scan of host OS processes for prohibited exam applications")
    public ResponseEntity<DiagnosticCheckResponse> scanProcesses() {
        String os = System.getProperty("os.name", "Unknown");
        List<ProhibitedAppDto> prohibitedList = new ArrayList<>();
        Map<String, ProhibitedAppDto> appMap = new LinkedHashMap<>();
        int count = 0;

        try {
            if (os.toLowerCase().contains("win")) {
                ProcessBuilder pb = new ProcessBuilder("tasklist.exe", "/FO", "CSV", "/NH");
                Process proc = pb.start();
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(proc.getInputStream()))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        count++;
                        String lower = line.toLowerCase();
                        for (String kw : PROHIBITED_KEYWORDS) {
                            if (lower.contains(kw)) {
                                String[] parts = line.replace("\"", "").split(",");
                                if (parts.length >= 2) {
                                    String appName = parts[0].trim();
                                    try {
                                        long pid = Long.parseLong(parts[1].trim());
                                        if (!appMap.containsKey(appName.toLowerCase())) {
                                            appMap.put(appName.toLowerCase(), new ProhibitedAppDto(
                                                    String.valueOf(pid),
                                                    appName,
                                                    pid,
                                                    false
                                            ));
                                        }
                                    } catch (NumberFormatException ignored) {}
                                }
                                break;
                            }
                        }
                    }
                }
                proc.waitFor(2, TimeUnit.SECONDS);
            } else {
                // macOS & Linux: ps -eo pid,comm
                ProcessBuilder pb = new ProcessBuilder("ps", "-eo", "pid,comm");
                Process proc = pb.start();
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(proc.getInputStream()))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        count++;
                        line = line.trim();
                        if (line.startsWith("PID") || line.isEmpty()) continue;

                        String[] parts = line.split("\\s+", 2);
                        if (parts.length >= 2) {
                            try {
                                long pid = Long.parseLong(parts[0]);
                                String comm = parts[1];
                                String lower = comm.toLowerCase();

                                for (String kw : PROHIBITED_KEYWORDS) {
                                    if (lower.contains(kw) && !lower.contains("grep") && !lower.contains("curl")) {
                                        // Ignore system audio drivers or kernel extensions
                                        if (lower.contains(".driver") || lower.contains("/library/audio") || lower.contains("/system/library")) {
                                            continue;
                                        }

                                        String cleanName = extractCleanName(comm);
                                        String key = cleanName.toLowerCase();
                                        if (!appMap.containsKey(key)) {
                                            appMap.put(key, new ProhibitedAppDto(
                                                    String.valueOf(pid),
                                                    cleanName,
                                                    pid,
                                                    false
                                            ));
                                        }
                                        break;
                                    }
                                }
                            } catch (NumberFormatException ignored) {}
                        }
                    }
                }
                proc.waitFor(2, TimeUnit.SECONDS);
            }
        } catch (Exception e) {
            log.warn("System process scan encountered warning: {}", e.getMessage());
        }

        prohibitedList.addAll(appMap.values());
        boolean passed = prohibitedList.isEmpty();

        return ResponseEntity.ok(new DiagnosticCheckResponse(os, prohibitedList, count, passed));
    }

    @PostMapping("/kill-process")
    @Operation(summary = "Terminate a prohibited background application by PID or app name")
    public ResponseEntity<Map<String, Object>> killProcess(@RequestBody KillRequest request) {
        String os = System.getProperty("os.name", "Unknown").toLowerCase();
        boolean success = false;
        String msg = "";

        try {
            if (request.pid() != null && request.pid() > 0) {
                if (os.contains("win")) {
                    Process p = new ProcessBuilder("taskkill", "/PID", String.valueOf(request.pid()), "/F").start();
                    success = p.waitFor(3, TimeUnit.SECONDS) && p.exitValue() == 0;
                } else {
                    Process p = new ProcessBuilder("kill", "-15", String.valueOf(request.pid())).start();
                    success = p.waitFor(2, TimeUnit.SECONDS) && p.exitValue() == 0;
                    if (!success) {
                        Process p9 = new ProcessBuilder("kill", "-9", String.valueOf(request.pid())).start();
                        success = p9.waitFor(2, TimeUnit.SECONDS) && p9.exitValue() == 0;
                    }
                }
                msg = success ? "Process terminated successfully" : "Process already closed or cannot be killed";
            } else if (request.name() != null && !request.name().isBlank()) {
                if (os.contains("mac")) {
                    String app = request.name().replace(".app", "");
                    Process p = new ProcessBuilder("osascript", "-e", "tell application \"" + app + "\" to quit").start();
                    success = p.waitFor(2, TimeUnit.SECONDS);
                    msg = "Application close requested";
                }
            }
        } catch (Exception e) {
            msg = "Error: " + e.getMessage();
        }

        return ResponseEntity.ok(Map.of("success", success, "message", msg));
    }

    @PostMapping("/kill-all-prohibited")
    @Operation(summary = "Terminate all detected prohibited applications")
    public ResponseEntity<Map<String, Object>> killAllProhibited() {
        ResponseEntity<DiagnosticCheckResponse> scan = scanProcesses();
        DiagnosticCheckResponse body = scan.getBody();
        int killed = 0;

        if (body != null && body.prohibitedApps() != null) {
            for (ProhibitedAppDto app : body.prohibitedApps()) {
                killProcess(new KillRequest(app.pid(), app.name()));
                killed++;
            }
        }

        return ResponseEntity.ok(Map.of("success", true, "terminatedCount", killed));
    }

    private String extractCleanName(String fullPath) {
        if (fullPath.contains(".app")) {
            int appIdx = fullPath.indexOf(".app");
            int slashIdx = fullPath.lastIndexOf('/', appIdx);
            if (slashIdx >= 0 && slashIdx < appIdx) {
                return fullPath.substring(slashIdx + 1, appIdx + 4);
            }
        }
        if (fullPath.toLowerCase().contains("teams")) {
            return "Microsoft Teams.app";
        }
        int lastSlash = fullPath.lastIndexOf('/');
        if (lastSlash >= 0 && lastSlash < fullPath.length() - 1) {
            return fullPath.substring(lastSlash + 1);
        }
        return fullPath;
    }
}
