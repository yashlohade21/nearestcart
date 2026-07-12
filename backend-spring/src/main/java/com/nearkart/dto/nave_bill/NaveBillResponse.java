package com.nearkart.dto.nave_bill;

import com.nearkart.entity.NaveBill;
import com.nearkart.entity.NaveBillDetail;
import com.nearkart.entity.NaveBillItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Data @Builder @AllArgsConstructor
public class NaveBillResponse {
    private UUID id; private UUID userId; private UUID companyId; private UUID buyerId;
    private String billNo; private LocalDate billDate; private BigDecimal totalAmount;
    private BigDecimal totalDeductions; private BigDecimal netAmount; private String status;
    private OffsetDateTime createdAt; private OffsetDateTime updatedAt;
    private List<NaveBillItemResponse> items;
    private NaveBillDetailResponse details;

    @Data @Builder @AllArgsConstructor
    public static class NaveBillItemResponse {
        private UUID id; private UUID naveBillId; private UUID productId;
        private String kharidarName; private String pautiNo;
        private BigDecimal weight; private BigDecimal rate; private BigDecimal amount;
        private OffsetDateTime createdAt; private OffsetDateTime updatedAt;

        public static NaveBillItemResponse from(NaveBillItem i) {
            return NaveBillItemResponse.builder()
                    .id(i.getId()).naveBillId(i.getNaveBillId()).productId(i.getProductId())
                    .kharidarName(i.getKharidarName()).pautiNo(i.getPautiNo())
                    .weight(i.getWeight()).rate(i.getRate()).amount(i.getAmount())
                    .createdAt(i.getCreatedAt()).updatedAt(i.getUpdatedAt()).build();
        }
    }

    @Data @Builder @AllArgsConstructor
    public static class NaveBillDetailResponse {
        private UUID id; private UUID naveBillId;
        private BigDecimal marketFees; private BigDecimal supervision; private BigDecimal adat;
        private BigDecimal bardan; private BigDecimal labour; private BigDecimal gadiBhada;
        private BigDecimal sutli; private BigDecimal weightShort;
        private OffsetDateTime createdAt; private OffsetDateTime updatedAt;

        public static NaveBillDetailResponse from(NaveBillDetail d) {
            if (d == null) return null;
            return NaveBillDetailResponse.builder()
                    .id(d.getId()).naveBillId(d.getNaveBillId())
                    .marketFees(d.getMarketFees()).supervision(d.getSupervision()).adat(d.getAdat())
                    .bardan(d.getBardan()).labour(d.getLabour()).gadiBhada(d.getGadiBhada())
                    .sutli(d.getSutli()).weightShort(d.getWeightShort())
                    .createdAt(d.getCreatedAt()).updatedAt(d.getUpdatedAt()).build();
        }
    }

    public static NaveBillResponse from(NaveBill b) {
        return NaveBillResponse.builder()
                .id(b.getId()).userId(b.getUserId()).companyId(b.getCompanyId()).buyerId(b.getBuyerId())
                .billNo(b.getBillNo()).billDate(b.getBillDate()).totalAmount(b.getTotalAmount())
                .totalDeductions(b.getTotalDeductions()).netAmount(b.getNetAmount()).status(b.getStatus())
                .createdAt(b.getCreatedAt()).updatedAt(b.getUpdatedAt())
                .items(b.getItems() != null ? b.getItems().stream().map(NaveBillItemResponse::from).collect(Collectors.toList()) : null)
                .details(NaveBillDetailResponse.from(b.getDetails()))
                .build();
    }
}
