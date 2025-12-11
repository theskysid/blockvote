package com.blockvote.controller;

import com.blockvote.dto.*;
import com.blockvote.entity.User;
import com.blockvote.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@RequestBody LoginRequest request) {
        try {
            LoginResponse response = authService.login(request);
            return ResponseEntity.ok(new ApiResponse(true, "Login successful", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@RequestBody RegisterRequest request) {
        try {
            User newVoter = authService.register(request);
            return ResponseEntity
                    .ok(new ApiResponse(true, "Registration successful! You can now login with OTP: 123456", newVoter));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    /**
     * Step 1: Initialize wallet verification challenge.
     * Returns a message to be signed by the user's MetaMask wallet.
     */
    @PostMapping("/wallet-init")
    public ResponseEntity<ApiResponse> initWalletChallenge(@RequestBody WalletChallengeRequest request) {
        try {
            WalletChallengeResponse response = authService.initializeWalletChallenge(request);

            if (response.isAlreadyRegistered()) {
                return ResponseEntity.ok(new ApiResponse(
                        true,
                        "Wallet already registered: " + response.getRegisteredWallet(),
                        response));
            }

            return ResponseEntity.ok(new ApiResponse(
                    true,
                    "Challenge generated. Please sign the message with your MetaMask wallet.",
                    response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    /**
     * Step 2: Verify wallet signature and bind wallet to user account.
     * This permanently links the MetaMask wallet to the mobile number.
     */
    @PostMapping("/verify-wallet")
    public ResponseEntity<ApiResponse> verifyWallet(@RequestBody WalletVerificationRequest request) {
        try {
            System.out.println("📥 Received verification request:");
            System.out.println("   Mobile: " + request.getMobileNumber());
            System.out.println("   Wallet: " + request.getWalletAddress());
            System.out.println("   Nonce: " + request.getNonce());
            System.out.println("   Signature: "
                    + (request.getSignature() != null ? request.getSignature().substring(0, 20) + "..." : "null"));

            User user = authService.verifyAndBindWallet(request);
            return ResponseEntity.ok(new ApiResponse(
                    true,
                    "Wallet verified and bound successfully! You can now vote.",
                    user));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
}