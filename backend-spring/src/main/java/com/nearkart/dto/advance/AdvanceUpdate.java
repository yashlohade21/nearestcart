package com.nearkart.dto.advance;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class AdvanceUpdate {
    private BigDecimal recovered;
    private String status;
    private LocalDate expectedRecoveryDate;
    private String notes;
}
