package com.nearkart.dto.farmer_flow;

import com.nearkart.entity.FarmerPayment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data @Builder @AllArgsConstructor
public class FarmerPaymentResponse {
    private UUID id; private UUID userId; private UUID companyId; private UUID farmerId;
    private LocalDate paymentDate; private BigDecimal amount; private BigDecimal cashAmount;
    private String bankName; private String chequeNo; private String narration;
    private OffsetDateTime createdAt; private OffsetDateTime updatedAt;
    private String farmerName;

    public static FarmerPaymentResponse from(FarmerPayment p) {
        return FarmerPaymentResponse.builder()
                .id(p.getId()).userId(p.getUserId()).companyId(p.getCompanyId()).farmerId(p.getFarmerId())
                .paymentDate(p.getPaymentDate()).amount(p.getAmount()).cashAmount(p.getCashAmount())
                .bankName(p.getBankName()).chequeNo(p.getChequeNo()).narration(p.getNarration())
                .createdAt(p.getCreatedAt()).updatedAt(p.getUpdatedAt())
                .farmerName(p.getFarmer() != null ? p.getFarmer().getName() : null).build();
    }
}
