package com.nearkart.dto.deal;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class DealUpdate {
    private UUID farmerId;
    private UUID buyerId;
    private UUID productId;
    private BigDecimal quantity;
    private String unit;
    private BigDecimal buyRate;
    private BigDecimal sellRate;
    private BigDecimal transportCost;
    private BigDecimal labourCost;
    private BigDecimal otherCost;
    private String status;
    private String farmerPaymentStatus;
    private String buyerPaymentStatus;
    private BigDecimal farmerPaidAmount;
    private BigDecimal buyerReceivedAmount;
    private BigDecimal spoilageQty;
    private String spoilageReason;
    private UUID transporterId;
    private LocalDate dealDate;
    private LocalDate deliveryDate;
    private LocalDate paymentDueDate;
    private String qualityGrade;
    private Boolean hasDispute;
    private String disputeNotes;
    private String notes;
}
