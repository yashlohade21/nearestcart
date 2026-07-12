package com.nearkart.dto.kharidar;

import lombok.Data;
import java.util.UUID;

@Data
public class KharidarUpdate {
    private UUID companyId; private String name; private String phone; private String address; private Boolean isActive;
}
