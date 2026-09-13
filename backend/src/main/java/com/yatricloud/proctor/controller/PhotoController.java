package com.yatricloud.proctor.controller;

import com.yatricloud.proctor.model.Photo;
import com.yatricloud.proctor.service.PhotoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/photos")
@Tag(name = "Photos", description = "Photo Retrieval APIs")
@CrossOrigin(origins = "*")
public class PhotoController {

    private final PhotoService photoService;

    public PhotoController(PhotoService photoService) {
        this.photoService = photoService;
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get photo binary data")
    public ResponseEntity<byte[]> getPhoto(@PathVariable Long id) {
        Photo photo = photoService.get(id);
        HttpHeaders headers = new HttpHeaders();
        try {
            headers.setContentType(MediaType.parseMediaType(photo.getContentType()));
        } catch (Exception e) {
            headers.setContentType(MediaType.IMAGE_JPEG);
        }
        return new ResponseEntity<>(photo.getData(), headers, HttpStatus.OK);
    }
}
