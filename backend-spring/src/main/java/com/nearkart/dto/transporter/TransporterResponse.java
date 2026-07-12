package com.nearkart.dto.transporter;

import com.nearkart.entity.Transporter;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data @Builder @AllArgsConstructor
public class TransporterResponse {
    private UUID id; private UUID userId; private String name; private String phone;
    private String vehicleType; private String vehicleNumber; private String baseCity;
    private BigDecimal avgCostPerKm; private BigDecimal avgSpoilagePct; private BigDecimal onTimePct;
    private Integer totalTrips; private BigDecimal rating; private Boolean isActive;
    private String notes; private OffsetDateTime createdAt; private OffsetDateTime updatedAt;

    public static TransporterResponse from(Transporter t) {
        return TransporterResponse.builder()
                .id(t.getId()).userId(t.getUserId()).name(t.getName()).phone(t.getPhone())
                .vehicleType(t.getVehicleType()).vehicleNumber(t.getVehicleNumber()).baseCity(t.getBaseCity())
                .avgCostPerKm(t.getAvgCostPerKm()).avgSpoilagePct(t.getAvgSpoilagePct()).onTimePct(t.getOnTimePct())
                .totalTrips(t.getTotalTrips()).rating(t.getRating()).isActive(t.getIsActive())
                .notes(t.getNotes()).createdAt(t.getCreatedAt()).updatedAt(t.getUpdatedAt()).build();
    }
}
