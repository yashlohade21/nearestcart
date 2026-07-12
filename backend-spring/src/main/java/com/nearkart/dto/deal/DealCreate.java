package com.nearkart.dto.deal;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class DealCreate {
    private UUID farmerId;
    private UUID buyerId;
    @NotNull private UUID productId;
    @NotNull private BigDecimal quantity;
    private String unit = "kg";
    @NotNull private BigDecimal buyRate;
    @NotNull private BigDecimal sellRate;
    private BigDecimal transportCost;
    private BigDecimal labourCost;
    private BigDecimal otherCost;
    private UUID transporterId;
    private LocalDate dealDate;
    private LocalDate deliveryDate;
    private LocalDate paymentDueDate;
    private String qualityGrade;
    private String notes;
}
