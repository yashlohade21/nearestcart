package com.nearkart.dto.bank;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class BankTransactionCreate {
    private UUID companyId;
    @NotNull private UUID bankAccountId;
    private LocalDate txnDate;
    @NotNull private String type;
    @NotNull private BigDecimal amount;
    private String partyName; private String chequeNo; private LocalDate chequeDate;
    private String narration; private Boolean reconciled;
}
