package com.nearkart.dto.delivery_place;

import lombok.Data;
import java.util.UUID;

@Data
public class DeliveryPlaceUpdate {
    private UUID companyId; private String placeName; private String district; private String state;
}
