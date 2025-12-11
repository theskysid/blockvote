package com.blockvote.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {
    private String mobileNumber;
    private String otp;
    private String walletAddress; // Optional: used to validate wallet-verified users
}
