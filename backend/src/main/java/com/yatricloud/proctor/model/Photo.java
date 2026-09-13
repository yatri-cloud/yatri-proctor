package com.yatricloud.proctor.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "photos")
public class Photo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "session_id")
    private ExamSession session;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PhotoType photoType;

    @Column(length = 50)
    private String direction;

    @Column(length = 50)
    private String idSide;

    @Column(nullable = false)
    private String contentType;

    @Column(nullable = false, columnDefinition = "VARBINARY")
    private byte[] data;

    @Column(nullable = false)
    private Instant capturedAt;

    private Instant deleteAfter;

    public Photo() {}

    @PrePersist
    protected void onCreate() {
        if (capturedAt == null) capturedAt = Instant.now();
        if (deleteAfter == null) deleteAfter = Instant.now().plusSeconds(30L * 24 * 60 * 60);
    }

    public enum PhotoType { FACE, ROOM_SCAN, ID_FRONT, ID_BACK }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public ExamSession getSession() { return session; }
    public void setSession(ExamSession session) { this.session = session; }

    public PhotoType getPhotoType() { return photoType; }
    public void setPhotoType(PhotoType photoType) { this.photoType = photoType; }

    public String getDirection() { return direction; }
    public void setDirection(String direction) { this.direction = direction; }

    public String getIdSide() { return idSide; }
    public void setIdSide(String idSide) { this.idSide = idSide; }

    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }

    public byte[] getData() { return data; }
    public void setData(byte[] data) { this.data = data; }

    public Instant getCapturedAt() { return capturedAt; }
    public void setCapturedAt(Instant capturedAt) { this.capturedAt = capturedAt; }

    public Instant getDeleteAfter() { return deleteAfter; }
    public void setDeleteAfter(Instant deleteAfter) { this.deleteAfter = deleteAfter; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private ExamSession session;
        private PhotoType photoType;
        private String direction;
        private String idSide;
        private String contentType;
        private byte[] data;
        private Instant capturedAt;
        private Instant deleteAfter;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder session(ExamSession session) { this.session = session; return this; }
        public Builder photoType(PhotoType photoType) { this.photoType = photoType; return this; }
        public Builder direction(String direction) { this.direction = direction; return this; }
        public Builder idSide(String idSide) { this.idSide = idSide; return this; }
        public Builder contentType(String contentType) { this.contentType = contentType; return this; }
        public Builder data(byte[] data) { this.data = data; return this; }
        public Builder capturedAt(Instant capturedAt) { this.capturedAt = capturedAt; return this; }
        public Builder deleteAfter(Instant deleteAfter) { this.deleteAfter = deleteAfter; return this; }

        public Photo build() {
            Photo p = new Photo();
            p.setId(this.id);
            p.setSession(this.session);
            p.setPhotoType(this.photoType);
            p.setDirection(this.direction);
            p.setIdSide(this.idSide);
            p.setContentType(this.contentType);
            p.setData(this.data);
            p.setCapturedAt(this.capturedAt);
            p.setDeleteAfter(this.deleteAfter);
            return p;
        }
    }
}
