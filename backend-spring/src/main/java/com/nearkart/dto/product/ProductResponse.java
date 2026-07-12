package com.nearkart.dto.product;

import com.nearkart.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data @Builder @AllArgsConstructor
public class ProductResponse {
    private UUID id; private UUID userId; private String name; private String nameLocal;
    private String category; private String unit; private String hsnCode;
    private BigDecimal purchasePrice; private BigDecimal sellingPrice;
    private BigDecimal minStock; private BigDecimal currentStock;
    private Boolean isPerishable; private BigDecimal avgSpoilagePct;
    private Boolean isActive; private OffsetDateTime createdAt;

    public static ProductResponse from(Product p) {
        return ProductResponse.builder()
                .id(p.getId()).userId(p.getUserId()).name(p.getName()).nameLocal(p.getNameLocal())
                .category(p.getCategory()).unit(p.getUnit()).hsnCode(p.getHsnCode())
                .purchasePrice(p.getPurchasePrice()).sellingPrice(p.getSellingPrice())
                .minStock(p.getMinStock()).currentStock(p.getCurrentStock())
                .isPerishable(p.getIsPerishable()).avgSpoilagePct(p.getAvgSpoilagePct())
                .isActive(p.getIsActive()).createdAt(p.getCreatedAt())
                .build();
    }
}
