package com.yatricloud.proctor.repository;

import com.yatricloud.proctor.model.SessionAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SessionAnswerRepository extends JpaRepository<SessionAnswer, Long> {
    List<SessionAnswer> findBySessionId(Long sessionId);
    Optional<SessionAnswer> findBySessionIdAndQuestionId(Long sessionId, Long questionId);
}
