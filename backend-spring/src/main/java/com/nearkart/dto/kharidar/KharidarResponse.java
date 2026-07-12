package com.nearkart.dto.kharidar;

import com.nearkart.entity.Kharidar;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data @Builder @AllArgsConstructor
public class KharidarResponse {
    private UUID id; private UUID userId; private UUID companyId;
    private String name; private String phone; private String address;
    private Boolean isActive; private OffsetDateTime createdAt; private OffsetDateTime updatedAt;

    public static KharidarResponse from(Kharidar k) {
        return KharidarResponse.builder()
                .id(k.getId()).userId(k.getUserId()).companyId(k.getCompanyId())
                .name(k.getName()).phone(k.getPhone()).address(k.getAddress())
                .isActive(k.getIsActive()).createdAt(k.getCreatedAt()).updatedAt(k.getUpdatedAt()).build();
    }
}
