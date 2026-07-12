package com.nearkart.dto.bank;

import com.nearkart.entity.BankTransaction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data @Builder @AllArgsConstructor
public class BankTransactionResponse {
    private UUID id; private UUID userId; private UUID companyId; private UUID bankAccountId;
    private LocalDate txnDate; private String type; private BigDecimal amount;
    private String partyName; private String chequeNo; private LocalDate chequeDate;
    private String narration; private Boolean reconciled;
    private OffsetDateTime createdAt; private OffsetDateTime updatedAt;

    public static BankTransactionResponse from(BankTransaction t) {
        return BankTransactionResponse.builder()
                .id(t.getId()).userId(t.getUserId()).companyId(t.getCompanyId()).bankAccountId(t.getBankAccountId())
                .txnDate(t.getTxnDate()).type(t.getType()).amount(t.getAmount()).partyName(t.getPartyName())
                .chequeNo(t.getChequeNo()).chequeDate(t.getChequeDate()).narration(t.getNarration())
                .reconciled(t.getReconciled()).createdAt(t.getCreatedAt()).updatedAt(t.getUpdatedAt()).build();
    }
}
