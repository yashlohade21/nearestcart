package com.nearkart.dto.cash;

import com.nearkart.entity.CashEntry;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data @Builder @AllArgsConstructor
public class CashEntryResponse {
    private UUID id; private UUID userId; private UUID companyId; private LocalDate entryDate;
    private String type; private BigDecimal amount; private String narration; private String partyName;
    private String partyType; private String referenceNo; private String branch;
    private OffsetDateTime createdAt; private OffsetDateTime updatedAt;

    public static CashEntryResponse from(CashEntry c) {
        return CashEntryResponse.builder()
                .id(c.getId()).userId(c.getUserId()).companyId(c.getCompanyId()).entryDate(c.getEntryDate())
                .type(c.getType()).amount(c.getAmount()).narration(c.getNarration()).partyName(c.getPartyName())
                .partyType(c.getPartyType()).referenceNo(c.getReferenceNo()).branch(c.getBranch())
                .createdAt(c.getCreatedAt()).updatedAt(c.getUpdatedAt()).build();
    }
}
