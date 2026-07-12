package com.nearkart.dto.kharidar;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.UUID;

@Data
public class KharidarCreate {
    private UUID companyId; @NotBlank private String name; private String phone; private String address;
}
