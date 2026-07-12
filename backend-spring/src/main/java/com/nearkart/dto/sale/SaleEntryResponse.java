package com.nearkart.dto.sale;

import com.nearkart.entity.SaleEntry;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data @Builder @AllArgsConstructor
public class SaleEntryResponse {
    private UUID id; private UUID userId; private UUID companyId; private UUID buyerId;
    private UUID productId; private String invoiceNo; private LocalDate saleDate;
    private BigDecimal quantity; private BigDecimal rate; private BigDecimal grossAmount;
    private BigDecimal transportCost; private String lrNo; private String driverName;
    private String vehicleNo; private String ownerName; private String hsnCode;
    private BigDecimal tcsAmount; private BigDecimal addTopay; private BigDecimal lessTopay;
    private BigDecimal netAmount; private String poNo; private String branch;
    private OffsetDateTime createdAt; private OffsetDateTime updatedAt;

    public static SaleEntryResponse from(SaleEntry s) {
        return SaleEntryResponse.builder()
                .id(s.getId()).userId(s.getUserId()).companyId(s.getCompanyId()).buyerId(s.getBuyerId())
                .productId(s.getProductId()).invoiceNo(s.getInvoiceNo()).saleDate(s.getSaleDate())
                .quantity(s.getQuantity()).rate(s.getRate()).grossAmount(s.getGrossAmount())
                .transportCost(s.getTransportCost()).lrNo(s.getLrNo()).driverName(s.getDriverName())
                .vehicleNo(s.getVehicleNo()).ownerName(s.getOwnerName()).hsnCode(s.getHsnCode())
                .tcsAmount(s.getTcsAmount()).addTopay(s.getAddTopay()).lessTopay(s.getLessTopay())
                .netAmount(s.getNetAmount()).poNo(s.getPoNo()).branch(s.getBranch())
                .createdAt(s.getCreatedAt()).updatedAt(s.getUpdatedAt()).build();
    }
}
