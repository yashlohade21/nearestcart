package com.nearkart.dto.cash;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class CashEntryUpdate {
    private UUID companyId; private LocalDate entryDate; private String type;
    private BigDecimal amount; private String narration; private String partyName;
    private String partyType; private String referenceNo; private String branch;
}
