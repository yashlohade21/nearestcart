package com.nearkart.controller;

import com.nearkart.dto.auth.*;
import com.nearkart.entity.User;
import com.nearkart.repository.UserRepository;
import com.nearkart.security.JwtUtil;
import com.nearkart.security.OtpService;
import com.nearkart.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@Transactional
public class AuthController {

    private final OtpService otpService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final boolean devMode;

    public AuthController(OtpService otpService, JwtUtil jwtUtil, UserRepository userRepository,
                          @Value("${app.otp.dev-mode}") boolean devMode) {
        this.otpService = otpService;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.devMode = devMode;
    }

    @PostMapping("/otp/send")
    public Map<String, String> sendOtp(@Valid @RequestBody OtpSendRequest body) {
        String otp = otpService.sendOtp(body.getPhone());
        Map<String, String> response = new LinkedHashMap<>();
        response.put("message", "OTP sent");
        if (devMode) response.put("otp_dev", otp);
        return response;
    }

    @PostMapping("/otp/verify")
    public TokenResponse verifyOtp(@Valid @RequestBody OtpVerifyRequest body) {
        if (!otpService.verifyOtp(body.getPhone(), body.getOtp())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid OTP");
        }

        User user = userRepository.findByPhone(body.getPhone()).orElse(null);
        boolean isNew = false;

        if (user == null) {
            if (body.getName() == null || body.getName().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name required for new user");
            }
            user = User.builder().phone(body.getPhone()).name(body.getName()).build();
            user = userRepository.save(user);
            isNew = true;
        }

        String token = jwtUtil.createToken(user.getId());
        return TokenResponse.builder()
                .accessToken(token)
                .userId(user.getId().toString())
                .isNewUser(isNew)
                .build();
    }

    @GetMapping("/profile")
    public ProfileResponse getProfile(@AuthenticationPrincipal UserPrincipal principal) {
        return buildProfile(principal.getUser());
    }

    @GetMapping("/me")
    public ProfileResponse getMe(@AuthenticationPrincipal UserPrincipal principal) {
        return buildProfile(principal.getUser());
    }

    @PutMapping("/profile")
    public ProfileResponse updateProfile(@RequestBody ProfileUpdate body,
                                         @AuthenticationPrincipal UserPrincipal principal) {
        User user = principal.getUser();
        if (body.getName() != null) user.setName(body.getName());
        if (body.getBusinessName() != null) user.setBusinessName(body.getBusinessName());
        if (body.getCity() != null) user.setCity(body.getCity());
        if (body.getState() != null) user.setState(body.getState());
        if (body.getMandiName() != null) user.setMandiName(body.getMandiName());
        if (body.getLanguage() != null) user.setLanguage(body.getLanguage());
        if (body.getGstNumber() != null) user.setGstNumber(body.getGstNumber());
        if (body.getAddress() != null) user.setAddress(body.getAddress());
        if (body.getUpiId() != null) user.setUpiId(body.getUpiId());
        userRepository.save(user);
        return buildProfile(user);
    }

    @PostMapping("/profile/fcm-token")
    public Map<String, String> updateFcmToken(@Valid @RequestBody FcmTokenUpdate body,
                                              @AuthenticationPrincipal UserPrincipal principal) {
        User user = principal.getUser();
        user.setFcmToken(body.getFcmToken());
        userRepository.save(user);
        return Map.of("message", "FCM token updated");
    }

    @GetMapping("/team")
    public List<TeamMemberResponse> listTeam(@AuthenticationPrincipal UserPrincipal principal) {
        User user = principal.getUser();
        if (!"owner".equals(user.getRole()))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only owners can manage team");
        return userRepository.findByOwnerIdAndIsActiveTrue(user.getId()).stream()
                .map(m -> TeamMemberResponse.builder()
                        .id(m.getId().toString()).phone(m.getPhone()).name(m.getName())
                        .role(m.getRole()).createdAt(m.getCreatedAt().toString()).build())
                .toList();
    }

    @PostMapping("/team")
    @ResponseStatus(HttpStatus.CREATED)
    public TeamMemberResponse addTeamMember(@Valid @RequestBody TeamMemberCreate body,
                                            @AuthenticationPrincipal UserPrincipal principal) {
        User user = principal.getUser();
        if (!"owner".equals(user.getRole()))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only owners can manage team");
        if (!List.of("manager", "viewer").contains(body.getRole()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role must be 'manager' or 'viewer'");
        if (userRepository.findByPhone(body.getPhone()).isPresent())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Phone number already registered");

        User member = User.builder()
                .phone(body.getPhone()).name(body.getName())
                .role(body.getRole()).ownerId(user.getId()).build();
        member = userRepository.save(member);
        return TeamMemberResponse.builder()
                .id(member.getId().toString()).phone(member.getPhone()).name(member.getName())
                .role(member.getRole()).createdAt(member.getCreatedAt().toString()).build();
    }

    @DeleteMapping("/team/{memberId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeTeamMember(@PathVariable UUID memberId,
                                 @AuthenticationPrincipal UserPrincipal principal) {
        User user = principal.getUser();
        if (!"owner".equals(user.getRole()))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only owners can manage team");
        User member = userRepository.findById(memberId)
                .filter(m -> user.getId().equals(m.getOwnerId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Team member not found"));
        member.setIsActive(false);
        userRepository.save(member);
    }

    private ProfileResponse buildProfile(User u) {
        return ProfileResponse.builder()
                .id(u.getId().toString()).phone(u.getPhone()).name(u.getName())
                .businessName(u.getBusinessName()).city(u.getCity()).state(u.getState())
                .mandiName(u.getMandiName()).language(u.getLanguage()).gstNumber(u.getGstNumber())
                .address(u.getAddress()).logoUrl(u.getLogoUrl()).upiId(u.getUpiId())
                .role(u.getRole()).plan(u.getPlan()).build();
    }
}
