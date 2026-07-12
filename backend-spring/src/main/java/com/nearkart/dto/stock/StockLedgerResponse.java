package com.nearkart.dto.stock;

import com.nearkart.entity.StockLedger;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data @Builder @AllArgsConstructor
public class StockLedgerResponse {
    private UUID id; private UUID userId; private UUID companyId; private UUID productId;
    private LocalDate txnDate; private String txnType; private BigDecimal quantity;
    private UUID referenceId; private String referenceType; private BigDecimal balanceAfter;
    private OffsetDateTime createdAt; private OffsetDateTime updatedAt;
    private String productName;

    public static StockLedgerResponse from(StockLedger s) {
        return StockLedgerResponse.builder()
                .id(s.getId()).userId(s.getUserId()).companyId(s.getCompanyId()).productId(s.getProductId())
                .txnDate(s.getTxnDate()).txnType(s.getTxnType()).quantity(s.getQuantity())
                .referenceId(s.getReferenceId()).referenceType(s.getReferenceType())
                .balanceAfter(s.getBalanceAfter()).createdAt(s.getCreatedAt()).updatedAt(s.getUpdatedAt())
                .productName(s.getProduct() != null ? s.getProduct().getName() : null).build();
    }
}
