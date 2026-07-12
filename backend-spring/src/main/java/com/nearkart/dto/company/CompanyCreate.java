package com.nearkart.dto.company;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CompanyCreate {
    @NotBlank private String name;
    private String address; private String gstNo; private String panNo;
    private String logoUrl; private Boolean isDefault;
    private String phone; private String email;
    private String bankName; private String accountNo; private String ifscCode; private String branch;
}
