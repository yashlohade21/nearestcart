package com.nearkart.dto.vehicle;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.UUID;

@Data
public class VehicleCreate {
    private UUID companyId; @NotBlank private String vehicleNo;
    private String ownerName; private String driverName; private String phone; private String vehicleType;
}
