package com.nearkart.dto.sale;

import com.nearkart.entity.SalePayment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data @Builder @AllArgsConstructor
public class SalePaymentResponse {
    private UUID id; private UUID userId; private UUID companyId; private UUID buyerId;
    private LocalDate paymentDate; private String invoiceNo; private BigDecimal total;
    private BigDecimal received; private BigDecimal balance; private String bankName;
    private String chequeNo; private String paymentMode; private String narration;
    private OffsetDateTime createdAt; private OffsetDateTime updatedAt;

    public static SalePaymentResponse from(SalePayment s) {
        return SalePaymentResponse.builder()
                .id(s.getId()).userId(s.getUserId()).companyId(s.getCompanyId()).buyerId(s.getBuyerId())
                .paymentDate(s.getPaymentDate()).invoiceNo(s.getInvoiceNo()).total(s.getTotal())
                .received(s.getReceived()).balance(s.getBalance()).bankName(s.getBankName())
                .chequeNo(s.getChequeNo()).paymentMode(s.getPaymentMode()).narration(s.getNarration())
                .createdAt(s.getCreatedAt()).updatedAt(s.getUpdatedAt()).build();
    }
}
