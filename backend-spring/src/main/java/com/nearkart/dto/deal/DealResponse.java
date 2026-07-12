package com.nearkart.dto.deal;

import com.nearkart.entity.Deal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
public class DealResponse {
    private UUID id;
    private UUID userId;
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
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    // Computed
    private BigDecimal buyTotal;
    private BigDecimal sellTotal;
    private BigDecimal grossMargin;
    private BigDecimal totalCost;
    private BigDecimal netProfit;
    // Joined names
    private String farmerName;
    private String buyerName;
    private String productName;
    private String transporterName;
    private String vehicleNumber;
    private String vehicleType;

    public static DealResponse from(Deal d) {
        return DealResponse.builder()
                .id(d.getId())
                .userId(d.getUserId())
                .farmerId(d.getFarmerId())
                .buyerId(d.getBuyerId())
                .productId(d.getProductId())
                .quantity(d.getQuantity())
                .unit(d.getUnit())
                .buyRate(d.getBuyRate())
                .sellRate(d.getSellRate())
                .transportCost(d.getTransportCost())
                .labourCost(d.getLabourCost())
                .otherCost(d.getOtherCost())
                .status(d.getStatus())
                .farmerPaymentStatus(d.getFarmerPaymentStatus())
                .buyerPaymentStatus(d.getBuyerPaymentStatus())
                .farmerPaidAmount(d.getFarmerPaidAmount())
                .buyerReceivedAmount(d.getBuyerReceivedAmount())
                .spoilageQty(d.getSpoilageQty())
                .spoilageReason(d.getSpoilageReason())
                .transporterId(d.getTransporterId())
                .dealDate(d.getDealDate())
                .deliveryDate(d.getDeliveryDate())
                .paymentDueDate(d.getPaymentDueDate())
                .qualityGrade(d.getQualityGrade())
                .hasDispute(d.getHasDispute())
                .disputeNotes(d.getDisputeNotes())
                .notes(d.getNotes())
                .createdAt(d.getCreatedAt())
                .updatedAt(d.getUpdatedAt())
                .buyTotal(d.getBuyTotal() != null ? d.getBuyTotal() : d.computeBuyTotal())
                .sellTotal(d.getSellTotal() != null ? d.getSellTotal() : d.computeSellTotal())
                .grossMargin(d.getGrossMargin() != null ? d.getGrossMargin() : d.computeGrossMargin())
                .totalCost(d.getTotalCost() != null ? d.getTotalCost() : d.computeTotalCost())
                .netProfit(d.getNetProfit() != null ? d.getNetProfit() : d.computeNetProfit())
                .farmerName(d.getFarmer() != null ? d.getFarmer().getName() : null)
                .buyerName(d.getBuyer() != null ? d.getBuyer().getName() : null)
                .productName(d.getProduct() != null ? d.getProduct().getName() : null)
                .transporterName(d.getTransporter() != null ? d.getTransporter().getName() : null)
                .vehicleNumber(d.getTransporter() != null ? d.getTransporter().getVehicleNumber() : null)
                .vehicleType(d.getTransporter() != null ? d.getTransporter().getVehicleType() : null)
                .build();
    }
}
