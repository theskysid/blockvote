package com.blockvote.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WalletChallengeResponse {
    private String message;
    private String nonce;
    private boolean alreadyRegistered;
    private String registeredWallet; // Only populated if alreadyRegistered is true
}
