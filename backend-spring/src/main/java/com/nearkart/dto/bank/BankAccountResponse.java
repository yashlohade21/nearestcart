package com.nearkart.dto.bank;

import com.nearkart.entity.BankAccount;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data @Builder @AllArgsConstructor
public class BankAccountResponse {
    private UUID id; private UUID userId; private String bankName; private String accountHolderName;
    private String accountNo; private String accountType; private String ifscCode; private String branch;
    private BigDecimal openingBalance; private BigDecimal currentBalance;
    private String notes; private Boolean isActive; private OffsetDateTime createdAt;

    public static BankAccountResponse from(BankAccount b) {
        return BankAccountResponse.builder()
                .id(b.getId()).userId(b.getUserId()).bankName(b.getBankName())
                .accountHolderName(b.getAccountHolderName()).accountNo(b.getAccountNo())
                .accountType(b.getAccountType()).ifscCode(b.getIfscCode()).branch(b.getBranch())
                .openingBalance(b.getOpeningBalance()).currentBalance(b.getCurrentBalance())
                .notes(b.getNotes()).isActive(b.getIsActive()).createdAt(b.getCreatedAt()).build();
    }
}
