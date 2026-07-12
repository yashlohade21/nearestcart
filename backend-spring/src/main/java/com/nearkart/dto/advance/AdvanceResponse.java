package com.nearkart.dto.advance;

import com.nearkart.entity.Advance;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data @Builder @AllArgsConstructor
public class AdvanceResponse {
    private UUID id; private UUID userId; private UUID farmerId;
    private BigDecimal amount; private BigDecimal recovered; private BigDecimal balance;
    private String purpose; private LocalDate givenDate; private LocalDate expectedRecoveryDate;
    private String status; private String notes;
    private OffsetDateTime createdAt; private OffsetDateTime updatedAt;
    private String farmerName;

    public static AdvanceResponse from(Advance a) {
        return AdvanceResponse.builder()
                .id(a.getId()).userId(a.getUserId()).farmerId(a.getFarmerId())
                .amount(a.getAmount()).recovered(a.getRecovered()).balance(a.getBalance())
                .purpose(a.getPurpose()).givenDate(a.getGivenDate()).expectedRecoveryDate(a.getExpectedRecoveryDate())
                .status(a.getStatus()).notes(a.getNotes()).createdAt(a.getCreatedAt()).updatedAt(a.getUpdatedAt())
                .farmerName(a.getFarmer() != null ? a.getFarmer().getName() : null)
                .build();
    }
}
