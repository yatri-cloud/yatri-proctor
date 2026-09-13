package com.yatricloud.proctor.repository;

import com.yatricloud.proctor.model.Photo;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PhotoRepository extends JpaRepository<Photo, Long> {
    List<Photo> findBySessionId(Long sessionId);
}
