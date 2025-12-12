package com.blockvote.service;

import com.blockvote.dto.*;
import com.blockvote.entity.User;
import com.blockvote.repository.UserRepository;
import com.blockvote.util.WalletVerificationUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private static final String HARDCODED_OTP = "123456";

    // Store nonces temporarily (in production, use Redis or database with TTL)
    private final Map<String, String> nonceStore = new ConcurrentHashMap<>();

    public LoginResponse login(LoginRequest request) {
        // Validate OTP
        if (!HARDCODED_OTP.equals(request.getOtp())) {
            throw new RuntimeException("Invalid OTP");
        }

        // Find user by mobile number
        User user = userRepository.findByMobileNumber(request.getMobileNumber())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // SECURITY CHECK: If user has a registered wallet, validate they're logging in
        // with that wallet
        if (user.isWalletVerified() && user.getRegisteredWalletAddress() != null) {
            // Wallet address should be provided in the request for wallet-verified users
            if (request.getWalletAddress() == null || request.getWalletAddress().trim().isEmpty()) {
                throw new RuntimeException("This account is wallet-verified. Please connect your wallet (" +
                        user.getRegisteredWalletAddress().substring(0, 8) + "...) to proceed with login.");
            }

            // Normalize addresses for comparison (case-insensitive)
            String normalizedRegistered = user.getRegisteredWalletAddress().toLowerCase();
            String normalizedProvided = request.getWalletAddress().toLowerCase();

            if (!normalizedRegistered.equals(normalizedProvided)) {
                throw new RuntimeException(
                        "Wallet address mismatch! You must login with your registered wallet address.");
            }
        }

        return new LoginResponse(
                "Login successful",
                user.getRole(),
                user.getMobileNumber(),
                user.getWalletAddress(),
                user.isHasVoted(),
                user.isWalletVerified(),
                user.getRegisteredWalletAddress());
    }

    @Transactional
    public User register(RegisterRequest request) {
        // Validate mobile number format
        if (request.getMobileNumber() == null || !request.getMobileNumber().matches("\\d{10}")) {
            throw new RuntimeException("Invalid mobile number. Must be 10 digits.");
        }

        // Check if mobile number already exists
        if (userRepository.findByMobileNumber(request.getMobileNumber()).isPresent()) {
            throw new RuntimeException("Mobile number already registered");
        }

        // Validate wallet address
        if (request.getWalletAddress() == null || request.getWalletAddress().trim().isEmpty()) {
            throw new RuntimeException("Wallet address is required");
        }

        // Check if wallet address already exists
        if (userRepository.findByWalletAddress(request.getWalletAddress()).isPresent()) {
            throw new RuntimeException("Wallet address already registered");
        }

        // Create new voter
        User newVoter = new User();
        newVoter.setMobileNumber(request.getMobileNumber());
        newVoter.setRole("VOTER");
        newVoter.setWalletAddress(request.getWalletAddress());
        newVoter.setHasVoted(false);

        return userRepository.save(newVoter);
    }

    /**
     * Generates a challenge message for wallet signature verification.
     * Step 1 of wallet authentication flow.
     */
    public WalletChallengeResponse initializeWalletChallenge(WalletChallengeRequest request) {
        // Find user by mobile number
        User user = userRepository.findByMobileNumber(request.getMobileNumber())
                .orElseThrow(() -> new RuntimeException("User not found. Please login with OTP first."));

        // Check if wallet already registered
        if (user.isWalletVerified() && user.getRegisteredWalletAddress() != null) {
            return new WalletChallengeResponse(
                    null,
                    null,
                    true,
                    user.getRegisteredWalletAddress());
        }

        // Generate nonce and challenge message
        String nonce = WalletVerificationUtil.generateNonce();
        String message = WalletVerificationUtil.generateChallengeMessage(
                request.getMobileNumber(),
                nonce);

        // Store nonce temporarily (expires after 5 minutes in production)
        nonceStore.put(request.getMobileNumber(), nonce);

        System.out.println("✅ Challenge Generated:");
        System.out.println("   Mobile: " + request.getMobileNumber());
        System.out.println("   Nonce: " + nonce);
        System.out.println("   NonceStore Size: " + nonceStore.size());

        return new WalletChallengeResponse(message, nonce, false, null);
    }

    /**
     * Verifies wallet signature and binds wallet to user account.
     * Step 2 of wallet authentication flow.
     */
    @Transactional
    public User verifyAndBindWallet(WalletVerificationRequest request) {
        // Validate Ethereum address format
        if (!WalletVerificationUtil.isValidEthereumAddress(request.getWalletAddress())) {
            throw new RuntimeException("Invalid Ethereum wallet address format");
        }

        // Find user by mobile number
        User user = userRepository.findByMobileNumber(request.getMobileNumber())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user already has a registered wallet
        if (user.isWalletVerified() && user.getRegisteredWalletAddress() != null) {
            // Verify they're using the same wallet
            String normalizedRegistered = user.getRegisteredWalletAddress().toLowerCase();
            String normalizedProvided = request.getWalletAddress().toLowerCase();

            if (!normalizedRegistered.equals(normalizedProvided)) {
                throw new RuntimeException(
                        "Wallet mismatch! This mobile number is already linked to wallet: " +
                                user.getRegisteredWalletAddress() +
                                ". You cannot change your registered wallet.");
            }

            // Same wallet, already verified
            return user;
        }

        // Verify nonce exists and matches
        String storedNonce = nonceStore.get(request.getMobileNumber());
        System.out.println("🔍 Nonce Verification:");
        System.out.println("   Mobile: " + request.getMobileNumber());
        System.out.println("   Stored Nonce: " + storedNonce);
        System.out.println("   Provided Nonce: " + request.getNonce());
        System.out.println("   NonceStore Size: " + nonceStore.size());

        if (storedNonce == null) {
            throw new RuntimeException("No active challenge found. Please request a new challenge.");
        }

        if (!storedNonce.equals(request.getNonce())) {
            throw new RuntimeException("Invalid nonce. Challenge expired or tampered.");
        }

        // Check if this wallet is already registered to another user
        userRepository.findByRegisteredWalletAddress(request.getWalletAddress())
                .ifPresent(existingUser -> {
                    if (!existingUser.getMobileNumber().equals(request.getMobileNumber())) {
                        throw new RuntimeException(
                                "This wallet is already registered to another mobile number");
                    }
                });

        // Reconstruct the challenge message
        String message = WalletVerificationUtil.generateChallengeMessage(
                request.getMobileNumber(),
                request.getNonce());

        // Verify signature
        boolean isValid = WalletVerificationUtil.verifySignature(
                message,
                request.getSignature(),
                request.getWalletAddress());

        if (!isValid) {
            throw new RuntimeException(
                    "Invalid signature. Wallet verification failed. " +
                            "Please ensure you're signing with the correct wallet.");
        }

        // Signature valid - bind wallet to user
        user.setRegisteredWalletAddress(request.getWalletAddress());
        user.setWalletVerified(true);

        // Remove used nonce
        nonceStore.remove(request.getMobileNumber());

        return userRepository.save(user);
    }

    /**
     * Checks if a user's wallet is verified.
     */
    public boolean isWalletVerified(String mobileNumber) {
        return userRepository.findByMobileNumber(mobileNumber)
                .map(User::isWalletVerified)
                .orElse(false);
    }
}
