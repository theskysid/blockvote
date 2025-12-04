package com.blockvote.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WalletVerificationRequest {
    private String mobileNumber;
    private String walletAddress;
    private String signature;
    private String nonce;
}
