package com.nearkart.dto.delivery_place;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.UUID;

@Data
public class DeliveryPlaceCreate {
    private UUID companyId; @NotBlank private String placeName; private String district; private String state;
}
