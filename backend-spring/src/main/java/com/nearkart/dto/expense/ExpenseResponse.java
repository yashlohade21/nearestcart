package com.nearkart.dto.expense;

import com.nearkart.entity.Expense;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data @Builder @AllArgsConstructor
public class ExpenseResponse {
    private UUID id; private UUID userId; private UUID companyId; private LocalDate expenseDate;
    private String category; private String narration; private BigDecimal amount; private String paymentMode;
    private UUID bankAccountId; private String chequeNo; private String partyName; private String farmerBillRef;
    private OffsetDateTime createdAt; private OffsetDateTime updatedAt;

    public static ExpenseResponse from(Expense e) {
        return ExpenseResponse.builder()
                .id(e.getId()).userId(e.getUserId()).companyId(e.getCompanyId()).expenseDate(e.getExpenseDate())
                .category(e.getCategory()).narration(e.getNarration()).amount(e.getAmount())
                .paymentMode(e.getPaymentMode()).bankAccountId(e.getBankAccountId()).chequeNo(e.getChequeNo())
                .partyName(e.getPartyName()).farmerBillRef(e.getFarmerBillRef())
                .createdAt(e.getCreatedAt()).updatedAt(e.getUpdatedAt()).build();
    }
}
