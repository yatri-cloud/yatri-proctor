package com.yatricloud.proctor.service;

import com.yatricloud.proctor.dto.SessionDTOs;
import com.yatricloud.proctor.model.*;
import com.yatricloud.proctor.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@Transactional
public class PhotoService {

    private static final Logger log = LoggerFactory.getLogger(PhotoService.class);

    private final ExamSessionRepository sessionRepo;
    private final PhotoRepository photoRepo;

    public PhotoService(ExamSessionRepository sessionRepo, PhotoRepository photoRepo) {
        this.sessionRepo = sessionRepo;
        this.photoRepo = photoRepo;
    }

    public SessionDTOs.PhotoUploadResponse upload(Long sessionId,
                                                   String photoTypeStr,
                                                   String direction,
                                                   String idSide,
                                                   MultipartFile file) throws IOException {

        ExamSession session = sessionRepo.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));

        Photo.PhotoType photoType = Photo.PhotoType.valueOf(photoTypeStr.toUpperCase());

        Photo photo = Photo.builder()
                .session(session)
                .photoType(photoType)
                .direction(direction)
                .idSide(idSide)
                .contentType(file.getContentType() != null ? file.getContentType() : "image/jpeg")
                .data(file.getBytes())
                .build();

        photo = photoRepo.save(photo);

        // Update session flags
        switch (photoType) {
            case FACE -> session.setPersonPhotoCaptured(true);
            case ROOM_SCAN -> {
                long scanCount = photoRepo.findBySessionId(sessionId).stream()
                        .filter(p -> p.getPhotoType() == Photo.PhotoType.ROOM_SCAN).count();
                if (scanCount >= 4) session.setRoomScansComplete(true);
            }
            case ID_BACK -> session.setIdVerified(true);
            default -> {}
        }
        sessionRepo.save(session);

        var resp = new SessionDTOs.PhotoUploadResponse();
        resp.setPhotoId(photo.getId());
        resp.setPhotoType(photoType.name());
        resp.setMessage("Photo uploaded successfully");
        return resp;
    }

    @Transactional(readOnly = true)
    public Photo get(Long photoId) {
        return photoRepo.findById(photoId)
                .orElseThrow(() -> new IllegalArgumentException("Photo not found"));
    }
}
