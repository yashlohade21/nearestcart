package com.nearkart.controller;

import com.nearkart.security.UserPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @GetMapping("/outstanding")
    public List<Map<String, Object>> outstanding(@AuthenticationPrincipal UserPrincipal principal) {
        return List.of();
    }

    @GetMapping("/daybook")
    public List<Map<String, Object>> daybook(@AuthenticationPrincipal UserPrincipal principal) {
        return List.of();
    }

    @GetMapping("/gst")
    public List<Map<String, Object>> gst(@AuthenticationPrincipal UserPrincipal principal) {
        return List.of();
    }

    @GetMapping("/party-ledger/{id}")
    public List<Map<String, Object>> partyLedger(@PathVariable UUID id,
                                                  @AuthenticationPrincipal UserPrincipal principal) {
        return List.of();
    }

    @GetMapping("/purchase-register")
    public List<Map<String, Object>> purchaseRegister(@AuthenticationPrincipal UserPrincipal principal) {
        return List.of();
    }

    @GetMapping("/sale-register")
    public List<Map<String, Object>> saleRegister(@AuthenticationPrincipal UserPrincipal principal) {
        return List.of();
    }

    @GetMapping("/stock")
    public List<Map<String, Object>> stock(@AuthenticationPrincipal UserPrincipal principal) {
        return List.of();
    }

    @GetMapping("/agent-commission")
    public List<Map<String, Object>> agentCommission(@AuthenticationPrincipal UserPrincipal principal) {
        return List.of();
    }
}
