package com.nearkart.dto.bank;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class BankAccountUpdate {
    private String bankName; private String accountHolderName; private String accountNo;
    private String accountType; private String ifscCode; private String branch;
    private BigDecimal openingBalance; private BigDecimal currentBalance;
    private String notes; private Boolean isActive;
}
