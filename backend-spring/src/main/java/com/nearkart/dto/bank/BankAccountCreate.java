package com.nearkart.dto.bank;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class BankAccountCreate {
    @NotBlank private String bankName;
    private String accountHolderName; private String accountNo; private String accountType;
    private String ifscCode; private String branch;
    private BigDecimal openingBalance; private String notes;
}
