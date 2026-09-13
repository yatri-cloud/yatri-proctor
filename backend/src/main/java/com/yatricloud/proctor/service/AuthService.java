package com.yatricloud.proctor.service;

import com.yatricloud.proctor.dto.AuthDTOs;
import com.yatricloud.proctor.model.User;
import com.yatricloud.proctor.repository.UserRepository;
import com.yatricloud.proctor.security.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @jakarta.annotation.PostConstruct
    public void seedInitialUsers() {
        if (!userRepository.existsByEmailIgnoreCase("admin@yatricloud.com")) {
            User admin = new User();
            admin.setEmail("admin@yatricloud.com");
            admin.setPasswordHash(passwordEncoder.encode("Admin@123"));
            admin.setFullName("Yatri Proctor Administrator");
            admin.setRole(User.Role.ROLE_ADMIN);
            admin.setCountry("IN");
            admin.setCity("Bangalore");
            admin.setPhoneNumber("+91 9876543210");
            admin.setActive(true);
            userRepository.save(admin);
            log.info("Seeded default admin user: admin@yatricloud.com / Admin@123");
        }

        if (!userRepository.existsByEmailIgnoreCase("candidate@yatricloud.com")) {
            User candidate = new User();
            candidate.setEmail("candidate@yatricloud.com");
            candidate.setPasswordHash(passwordEncoder.encode("Candidate@123"));
            candidate.setFullName("Yatharth Chauhan");
            candidate.setRole(User.Role.ROLE_USER);
            candidate.setCountry("IN");
            candidate.setCity("Bangalore");
            candidate.setPhoneNumber("+91 9876543211");
            candidate.setActive(true);
            userRepository.save(candidate);
            log.info("Seeded default candidate user: candidate@yatricloud.com / Candidate@123");
        }
    }

    public AuthDTOs.AuthResponse register(AuthDTOs.RegisterRequest request) {
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (request.getPassword() == null || request.getPassword().length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters");
        }

        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("An account with email " + email + " already exists");
        }

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName() != null && !request.getFullName().trim().isEmpty() ? request.getFullName().trim() : email);
        user.setRole(User.Role.ROLE_USER);
        user.setPhoneNumber(request.getPhoneNumber());
        user.setCountry(request.getCountry());
        user.setStateProvince(request.getStateProvince());
        user.setCity(request.getCity());
        user.setLinkedinUrl(request.getLinkedinUrl());
        user.setAvatarUrl(request.getAvatarUrl());
        user.setActive(true);

        user = userRepository.save(user);
        log.info("Registered new candidate user: {}", user.getEmail());

        String token = jwtTokenProvider.generateUserToken(user);
        return new AuthDTOs.AuthResponse(token, AuthDTOs.UserProfileDto.fromEntity(user), "Registration successful");
    }

    public AuthDTOs.AuthResponse login(AuthDTOs.LoginRequest request) {
        if (request.getEmail() == null || request.getPassword() == null) {
            throw new IllegalArgumentException("Email and password are required");
        }

        String email = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!user.isActive()) {
            throw new IllegalStateException("Account is deactivated. Please contact support.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        log.info("User authenticated successfully: {} (Role: {})", user.getEmail(), user.getRole());
        String token = jwtTokenProvider.generateUserToken(user);
        return new AuthDTOs.AuthResponse(token, AuthDTOs.UserProfileDto.fromEntity(user), "Login successful");
    }

    @Transactional(readOnly = true)
    public AuthDTOs.UserProfileDto getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return AuthDTOs.UserProfileDto.fromEntity(user);
    }

    public AuthDTOs.UserProfileDto updateProfile(Long userId, AuthDTOs.UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            user.setFullName(request.getFullName().trim());
        }
        if (request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());
        if (request.getCountry() != null) user.setCountry(request.getCountry());
        if (request.getStateProvince() != null) user.setStateProvince(request.getStateProvince());
        if (request.getCity() != null) user.setCity(request.getCity());
        if (request.getLinkedinUrl() != null) user.setLinkedinUrl(request.getLinkedinUrl());
        if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl());

        user = userRepository.save(user);
        return AuthDTOs.UserProfileDto.fromEntity(user);
    }

    public void forgotPassword(String email) {
        if (email == null) return;
        userRepository.findByEmailIgnoreCase(email.trim()).ifPresent(user -> {
            log.info("Password reset requested for {}", user.getEmail());
        });
    }
}
