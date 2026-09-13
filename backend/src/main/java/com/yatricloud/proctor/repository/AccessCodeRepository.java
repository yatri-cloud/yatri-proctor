package com.yatricloud.proctor.repository;

import com.yatricloud.proctor.model.AccessCode;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AccessCodeRepository extends JpaRepository<AccessCode, Long> {
    Optional<AccessCode> findByCode(String code);
}
