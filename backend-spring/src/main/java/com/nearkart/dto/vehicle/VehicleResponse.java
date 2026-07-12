package com.nearkart.dto.vehicle;

import com.nearkart.entity.Vehicle;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data @Builder @AllArgsConstructor
public class VehicleResponse {
    private UUID id; private UUID userId; private UUID companyId; private String vehicleNo;
    private String ownerName; private String driverName; private String phone;
    private String vehicleType; private Boolean isActive;
    private OffsetDateTime createdAt; private OffsetDateTime updatedAt;

    public static VehicleResponse from(Vehicle v) {
        return VehicleResponse.builder()
                .id(v.getId()).userId(v.getUserId()).companyId(v.getCompanyId()).vehicleNo(v.getVehicleNo())
                .ownerName(v.getOwnerName()).driverName(v.getDriverName()).phone(v.getPhone())
                .vehicleType(v.getVehicleType()).isActive(v.getIsActive())
                .createdAt(v.getCreatedAt()).updatedAt(v.getUpdatedAt()).build();
    }
}
