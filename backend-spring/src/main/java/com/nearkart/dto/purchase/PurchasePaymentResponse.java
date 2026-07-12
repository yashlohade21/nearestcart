package com.nearkart.dto.purchase;

import com.nearkart.entity.PurchasePayment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data @Builder @AllArgsConstructor
public class PurchasePaymentResponse {
    private UUID id; private UUID userId; private UUID companyId; private UUID supplierId;
    private LocalDate paymentDate; private String billNo; private BigDecimal total;
    private BigDecimal paid; private BigDecimal balance; private String bankName;
    private String chequeNo; private String paymentMode; private String narration;
    private OffsetDateTime createdAt; private OffsetDateTime updatedAt;

    public static PurchasePaymentResponse from(PurchasePayment p) {
        return PurchasePaymentResponse.builder()
                .id(p.getId()).userId(p.getUserId()).companyId(p.getCompanyId()).supplierId(p.getSupplierId())
                .paymentDate(p.getPaymentDate()).billNo(p.getBillNo()).total(p.getTotal()).paid(p.getPaid())
                .balance(p.getBalance()).bankName(p.getBankName()).chequeNo(p.getChequeNo())
                .paymentMode(p.getPaymentMode()).narration(p.getNarration())
                .createdAt(p.getCreatedAt()).updatedAt(p.getUpdatedAt()).build();
    }
}
