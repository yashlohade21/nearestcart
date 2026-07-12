package com.nearkart.dto.delivery_place;

import com.nearkart.entity.DeliveryPlace;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data @Builder @AllArgsConstructor
public class DeliveryPlaceResponse {
    private UUID id; private UUID userId; private UUID companyId;
    private String placeName; private String district; private String state;
    private OffsetDateTime createdAt; private OffsetDateTime updatedAt;

    public static DeliveryPlaceResponse from(DeliveryPlace d) {
        return DeliveryPlaceResponse.builder()
                .id(d.getId()).userId(d.getUserId()).companyId(d.getCompanyId())
                .placeName(d.getPlaceName()).district(d.getDistrict()).state(d.getState())
                .createdAt(d.getCreatedAt()).updatedAt(d.getUpdatedAt()).build();
    }
}
