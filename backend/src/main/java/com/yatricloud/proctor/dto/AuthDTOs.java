package com.yatricloud.proctor.dto;

import com.yatricloud.proctor.model.User;

public class AuthDTOs {

    public static class LoginRequest {
        private String email;
        private String password;

        public LoginRequest() {}
        public LoginRequest(String email, String password) {
            this.email = email;
            this.password = password;
        }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class RegisterRequest {
        private String email;
        private String password;
        private String fullName;
        private String phoneNumber;
        private String country;
        private String stateProvince;
        private String city;
        private String linkedinUrl;
        private String avatarUrl;

        public RegisterRequest() {}

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
        public String getCountry() { return country; }
        public void setCountry(String country) { this.country = country; }
        public String getStateProvince() { return stateProvince; }
        public void setStateProvince(String stateProvince) { this.stateProvince = stateProvince; }
        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }
        public String getLinkedinUrl() { return linkedinUrl; }
        public void setLinkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; }
        public String getAvatarUrl() { return avatarUrl; }
        public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    }

    public static class AuthResponse {
        private String token;
        private UserProfileDto user;
        private String message;

        public AuthResponse() {}
        public AuthResponse(String token, UserProfileDto user, String message) {
            this.token = token;
            this.user = user;
            this.message = message;
        }

        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
        public UserProfileDto getUser() { return user; }
        public void setUser(UserProfileDto user) { this.user = user; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

    public static class UserProfileDto {
        private Long id;
        private String email;
        private String fullName;
        private String role;
        private String phoneNumber;
        private String country;
        private String stateProvince;
        private String city;
        private String linkedinUrl;
        private String avatarUrl;
        private boolean active;
        private String createdAt;

        public UserProfileDto() {}

        public static UserProfileDto fromEntity(User u) {
            UserProfileDto dto = new UserProfileDto();
            dto.setId(u.getId());
            dto.setEmail(u.getEmail());
            dto.setFullName(u.getFullName());
            dto.setRole(u.getRole() != null ? u.getRole().name() : "ROLE_USER");
            dto.setPhoneNumber(u.getPhoneNumber());
            dto.setCountry(u.getCountry());
            dto.setStateProvince(u.getStateProvince());
            dto.setCity(u.getCity());
            dto.setLinkedinUrl(u.getLinkedinUrl());
            dto.setAvatarUrl(u.getAvatarUrl());
            dto.setActive(u.isActive());
            dto.setCreatedAt(u.getCreatedAt() != null ? u.getCreatedAt().toString() : null);
            return dto;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
        public String getCountry() { return country; }
        public void setCountry(String country) { this.country = country; }
        public String getStateProvince() { return stateProvince; }
        public void setStateProvince(String stateProvince) { this.stateProvince = stateProvince; }
        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }
        public String getLinkedinUrl() { return linkedinUrl; }
        public void setLinkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; }
        public String getAvatarUrl() { return avatarUrl; }
        public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
        public boolean isActive() { return active; }
        public void setActive(boolean active) { this.active = active; }
        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    }

    public static class ForgotPasswordRequest {
        private String email;

        public ForgotPasswordRequest() {}
        public ForgotPasswordRequest(String email) { this.email = email; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }

    public static class UpdateProfileRequest {
        private String fullName;
        private String phoneNumber;
        private String country;
        private String stateProvince;
        private String city;
        private String linkedinUrl;
        private String avatarUrl;

        public UpdateProfileRequest() {}

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
        public String getCountry() { return country; }
        public void setCountry(String country) { this.country = country; }
        public String getStateProvince() { return stateProvince; }
        public void setStateProvince(String stateProvince) { this.stateProvince = stateProvince; }
        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }
        public String getLinkedinUrl() { return linkedinUrl; }
        public void setLinkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; }
        public String getAvatarUrl() { return avatarUrl; }
        public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    }
}
