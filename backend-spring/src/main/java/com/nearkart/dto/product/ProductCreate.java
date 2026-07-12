package com.nearkart.dto.product;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductCreate {
    @NotBlank private String name;
    private String nameLocal;
    private String category;
    private String unit = "kg";
    private String hsnCode;
    private BigDecimal purchasePrice;
    private BigDecimal sellingPrice;
    private BigDecimal minStock;
    private BigDecimal currentStock;
    private Boolean isPerishable;
    private BigDecimal avgSpoilagePct;
}
