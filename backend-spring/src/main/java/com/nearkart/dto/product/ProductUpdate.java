package com.nearkart.dto.product;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductUpdate {
    private String name;
    private String nameLocal;
    private String category;
    private String unit;
    private String hsnCode;
    private BigDecimal purchasePrice;
    private BigDecimal sellingPrice;
    private BigDecimal minStock;
    private BigDecimal currentStock;
    private Boolean isPerishable;
    private BigDecimal avgSpoilagePct;
    private Boolean isActive;
}
