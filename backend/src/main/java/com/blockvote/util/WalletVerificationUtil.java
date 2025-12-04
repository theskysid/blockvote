package com.blockvote.util;

import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.web3j.crypto.Keys;
import org.web3j.crypto.Sign;
import org.web3j.utils.Numeric;

import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.Security;
import java.util.Arrays;

/**
 * Utility class for Ethereum wallet signature verification.
 * Implements the standard Ethereum message signing and verification flow.
 */
public class WalletVerificationUtil {

    static {
        // Register BouncyCastle provider for cryptographic operations
        Security.addProvider(new BouncyCastleProvider());
    }

    /**
     * Generates a challenge message for the user to sign.
     * This message includes a nonce to prevent replay attacks.
     * 
     * @param mobileNumber The user's mobile number
     * @param nonce        A random nonce for this session
     * @return The challenge message to be signed
     */
    public static String generateChallengeMessage(String mobileNumber, String nonce) {
        return String.format(
                "BlockVOTE Wallet Verification\n\n" +
                        "Mobile: %s\n" +
                        "Nonce: %s\n\n" +
                        "By signing this message, you verify ownership of this wallet.\n" +
                        "This wallet will be permanently linked to your mobile number.",
                mobileNumber, nonce);
    }

    /**
     * Generates a cryptographically secure nonce.
     * 
     * @return A 32-character hexadecimal nonce
     */
    public static String generateNonce() {
        return String.format("%032x", new BigInteger(128, new java.security.SecureRandom()));
    }

    /**
     * Verifies an Ethereum signature against a message and expected signer address.
     * Implements the Ethereum personal_sign verification flow.
     * 
     * @param message         The original message that was signed
     * @param signature       The signature hex string (with or without 0x prefix)
     * @param expectedAddress The expected Ethereum address (with or without 0x
     *                        prefix)
     * @return true if signature is valid and matches the expected address
     */
    public static boolean verifySignature(String message, String signature, String expectedAddress) {
        try {
            // Normalize inputs
            signature = Numeric.cleanHexPrefix(signature);
            expectedAddress = Numeric.cleanHexPrefix(expectedAddress).toLowerCase();

            // Ethereum uses a specific prefix for personal_sign
            String prefixedMessage = "\u0019Ethereum Signed Message:\n" + message.length() + message;

            // Hash the prefixed message
            byte[] messageHash = hash(prefixedMessage.getBytes(StandardCharsets.UTF_8));

            // Extract signature components (r, s, v)
            byte[] signatureBytes = Numeric.hexStringToByteArray(signature);

            if (signatureBytes.length != 65) {
                return false;
            }

            byte v = signatureBytes[64];
            if (v < 27) {
                v += 27;
            }

            byte[] r = Arrays.copyOfRange(signatureBytes, 0, 32);
            byte[] s = Arrays.copyOfRange(signatureBytes, 32, 64);

            // Recover the public key from signature
            Sign.SignatureData signatureData = new Sign.SignatureData(v, r, s);
            BigInteger publicKey = Sign.signedMessageHashToKey(messageHash, signatureData);

            // Derive Ethereum address from public key
            String recoveredAddress = "0x" + Keys.getAddress(publicKey);
            recoveredAddress = Numeric.cleanHexPrefix(recoveredAddress).toLowerCase();

            // Compare recovered address with expected address
            return recoveredAddress.equals(expectedAddress);

        } catch (Exception e) {
            System.err.println("Signature verification failed: " + e.getMessage());
            return false;
        }
    }

    /**
     * Validates if a string is a valid Ethereum address format.
     * 
     * @param address The address to validate
     * @return true if valid Ethereum address format
     */
    public static boolean isValidEthereumAddress(String address) {
        if (address == null || address.isEmpty()) {
            return false;
        }

        String cleaned = Numeric.cleanHexPrefix(address);

        // Ethereum addresses are 40 hex characters (20 bytes)
        return cleaned.matches("^[0-9a-fA-F]{40}$");
    }

    /**
     * Computes Keccak-256 hash of input data.
     * 
     * @param input The data to hash
     * @return The hash bytes
     */
    private static byte[] hash(byte[] input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("KECCAK-256", "BC");
            return digest.digest(input);
        } catch (Exception e) {
            throw new RuntimeException("Failed to compute hash", e);
        }
    }
}
