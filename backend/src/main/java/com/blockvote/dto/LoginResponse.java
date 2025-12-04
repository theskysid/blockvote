package com.blockvote.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String message;
    private String role;
    private String mobileNumber;
    private String walletAddress;
    private boolean hasVoted;
    private boolean walletVerified;
    private String registeredWalletAddress;
}
