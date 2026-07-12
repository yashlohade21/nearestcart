package com.nearkart.dto.bank;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class BankTransactionUpdate {
    private UUID companyId; private UUID bankAccountId; private LocalDate txnDate;
    private String type; private BigDecimal amount; private String partyName;
    private String chequeNo; private LocalDate chequeDate; private String narration; private Boolean reconciled;
}
