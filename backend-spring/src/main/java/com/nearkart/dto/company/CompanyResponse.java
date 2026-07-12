package com.nearkart.dto.company;

import com.nearkart.entity.Company;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data @Builder @AllArgsConstructor
public class CompanyResponse {
    private UUID id; private UUID userId; private String name; private String address;
    private String gstNo; private String panNo; private String logoUrl; private Boolean isDefault;
    private String phone; private String email;
    private String bankName; private String accountNo; private String ifscCode; private String branch;
    private OffsetDateTime createdAt; private OffsetDateTime updatedAt;

    public static CompanyResponse from(Company c) {
        return CompanyResponse.builder()
                .id(c.getId()).userId(c.getUserId()).name(c.getName()).address(c.getAddress())
                .gstNo(c.getGstNo()).panNo(c.getPanNo()).logoUrl(c.getLogoUrl()).isDefault(c.getIsDefault())
                .phone(c.getPhone()).email(c.getEmail()).bankName(c.getBankName()).accountNo(c.getAccountNo())
                .ifscCode(c.getIfscCode()).branch(c.getBranch()).createdAt(c.getCreatedAt()).updatedAt(c.getUpdatedAt())
                .build();
    }
}
