package com.nearkart.controller;

import com.nearkart.entity.User;
import com.nearkart.repository.UserRepository;
import com.nearkart.security.UserPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;

    public AdminController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/users")
    public List<Map<String, Object>> listUsers(@AuthenticationPrincipal UserPrincipal principal) {
        List<User> users = userRepository.findAll();
        return users.stream().map(u -> Map.<String, Object>of(
                "id", u.getId(),
                "phone", u.getPhone(),
                "name", u.getName() != null ? u.getName() : "",
                "role", u.getRole() != null ? u.getRole() : "",
                "isActive", u.getIsActive()
        )).toList();
    }

    @PostMapping("/users")
    public Map<String, Object> createUser(@RequestBody Map<String, Object> body,
                                           @AuthenticationPrincipal UserPrincipal principal) {
        return Map.of("status", "placeholder", "message", "User creation not yet implemented");
    }

    @PatchMapping("/users/{id}")
    public Map<String, Object> updateUser(@PathVariable UUID id,
                                           @RequestBody Map<String, Object> body,
                                           @AuthenticationPrincipal UserPrincipal principal) {
        return Map.of("status", "placeholder", "message", "User update not yet implemented");
    }

    @PostMapping("/users/{id}/toggle")
    public Map<String, Object> toggleUser(@PathVariable UUID id,
                                           @AuthenticationPrincipal UserPrincipal principal) {
        return Map.of("status", "placeholder", "message", "User toggle not yet implemented");
    }

    @GetMapping("/stats")
    public Map<String, Object> stats(@AuthenticationPrincipal UserPrincipal principal) {
        long totalUsers = userRepository.count();
        return Map.of(
                "totalUsers", totalUsers,
                "activeUsers", totalUsers,
                "totalDeals", 0,
                "totalRevenue", 0
        );
    }
}
