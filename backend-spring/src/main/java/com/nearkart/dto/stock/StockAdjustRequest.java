package com.nearkart.dto.stock;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class StockAdjustRequest {
    private UUID companyId; @NotNull private UUID productId; private LocalDate txnDate;
    @NotNull private String txnType; @NotNull private BigDecimal quantity;
    private UUID referenceId; private String referenceType;
}
