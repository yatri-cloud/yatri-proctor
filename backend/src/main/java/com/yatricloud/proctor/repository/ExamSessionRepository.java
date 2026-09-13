package com.yatricloud.proctor.repository;

import com.yatricloud.proctor.model.ExamSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ExamSessionRepository extends JpaRepository<ExamSession, Long> {
    Optional<ExamSession> findBySessionToken(String sessionToken);
    Optional<ExamSession> findByMobileToken(String mobileToken);
}
