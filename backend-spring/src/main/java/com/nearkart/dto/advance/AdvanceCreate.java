package com.nearkart.dto.advance;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class AdvanceCreate {
    @NotNull private UUID farmerId;
    @NotNull private BigDecimal amount;
    private String purpose;
    private LocalDate givenDate;
    private LocalDate expectedRecoveryDate;
    private String notes;
}
