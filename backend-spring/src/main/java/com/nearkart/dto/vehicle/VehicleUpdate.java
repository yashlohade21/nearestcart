package com.nearkart.dto.vehicle;

import lombok.Data;
import java.util.UUID;

@Data
public class VehicleUpdate {
    private UUID companyId; private String vehicleNo; private String ownerName;
    private String driverName; private String phone; private String vehicleType; private Boolean isActive;
}
