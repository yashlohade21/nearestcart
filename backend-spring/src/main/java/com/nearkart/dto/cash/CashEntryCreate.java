package com.nearkart.dto.cash;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class CashEntryCreate {
    private UUID companyId; private LocalDate entryDate;
    @NotNull private String type; @NotNull private BigDecimal amount;
    private String narration; private String partyName; private String partyType;
    private String referenceNo; private String branch;
}
