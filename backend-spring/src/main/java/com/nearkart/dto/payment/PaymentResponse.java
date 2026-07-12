package com.nearkart.dto.payment;

import com.nearkart.entity.Payment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data @Builder @AllArgsConstructor
public class PaymentResponse {
    private UUID id; private UUID userId; private UUID dealId; private UUID advanceId;
    private String direction; private UUID farmerId; private UUID buyerId;
    private BigDecimal amount; private String paymentMode; private String referenceNo;
    private LocalDate paymentDate; private String notes; private OffsetDateTime createdAt;

    public static PaymentResponse from(Payment p) {
        return PaymentResponse.builder()
                .id(p.getId()).userId(p.getUserId()).dealId(p.getDealId()).advanceId(p.getAdvanceId())
                .direction(p.getDirection()).farmerId(p.getFarmerId()).buyerId(p.getBuyerId())
                .amount(p.getAmount()).paymentMode(p.getPaymentMode()).referenceNo(p.getReferenceNo())
                .paymentDate(p.getPaymentDate()).notes(p.getNotes()).createdAt(p.getCreatedAt())
                .build();
    }
}
