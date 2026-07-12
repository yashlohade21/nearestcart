package com.nearkart.dto.expense;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class ExpenseUpdate {
    private UUID companyId; private LocalDate expenseDate; private String category;
    private String narration; private BigDecimal amount; private String paymentMode;
    private UUID bankAccountId; private String chequeNo; private String partyName; private String farmerBillRef;
}
