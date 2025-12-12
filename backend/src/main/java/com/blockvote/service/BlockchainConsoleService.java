package com.blockvote.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

/**
 * Service for broadcasting blockchain activity messages to the admin console
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BlockchainConsoleService {

    private final SimpMessagingTemplate messagingTemplate;
    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("HH:mm:ss");

    /**
     * Broadcast a message to the admin blockchain console
     */
    public void broadcastConsoleMessage(String message, ConsoleMessageType type) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("message", message);
            payload.put("type", type.toString().toLowerCase());
            payload.put("timestamp", LocalDateTime.now().format(TIME_FORMAT));

            messagingTemplate.convertAndSend("/topic/admin/blockchain-console", payload);

            log.debug("Broadcasted console message: {} (type: {})", message, type);
        } catch (Exception e) {
            log.error("Failed to broadcast console message: {}", message, e);
        }
    }

    /**
     * Broadcast admin wallet connection
     */
    public void broadcastWalletConnection(String walletAddress) {
        String message = String.format("> Admin wallet connected: %s...%s",
                walletAddress.substring(0, 6),
                walletAddress.substring(walletAddress.length() - 4));
        broadcastConsoleMessage(message, ConsoleMessageType.SUCCESS);
    }

    /**
     * Broadcast contract deployment start
     */
    public void broadcastContractDeploymentStart() {
        broadcastConsoleMessage("> Deploying election contract...", ConsoleMessageType.INFO);
    }

    /**
     * Broadcast successful contract deployment
     */
    public void broadcastContractDeploymentSuccess(String contractAddress) {
        String message = String.format("> ✔ Contract deployed at %s...%s",
                contractAddress.substring(0, 8),
                contractAddress.substring(contractAddress.length() - 4));
        broadcastConsoleMessage(message, ConsoleMessageType.SUCCESS);
    }

    /**
     * Broadcast contract deployment failure
     */
    public void broadcastContractDeploymentError(String error) {
        String message = String.format("> ⚠ Contract deployment failed: %s", error);
        broadcastConsoleMessage(message, ConsoleMessageType.ERROR);
    }

    /**
     * Broadcast vote transaction submission
     */
    public void broadcastVoteTransactionSubmitted(String candidateName, String txHash) {
        String message = String.format("> Vote cast for %s, tx: %s...%s",
                candidateName,
                txHash.substring(0, 8),
                txHash.substring(txHash.length() - 4));
        broadcastConsoleMessage(message, ConsoleMessageType.INFO);
    }

    /**
     * Broadcast transaction entering mempool
     */
    public void broadcastTransactionInMempool(String txHash) {
        String message = String.format("> Transaction %s...%s entered mempool",
                txHash.substring(0, 8),
                txHash.substring(txHash.length() - 4));
        broadcastConsoleMessage(message, ConsoleMessageType.INFO);
    }

    /**
     * Broadcast transaction confirmation
     */
    public void broadcastTransactionConfirmed(String txHash, long blockNumber) {
        String message = String.format("> ✔ Confirmation received (block #%d) for tx %s...%s",
                blockNumber,
                txHash.substring(0, 8),
                txHash.substring(txHash.length() - 4));
        broadcastConsoleMessage(message, ConsoleMessageType.SUCCESS);
    }

    /**
     * Broadcast transaction error or revert
     */
    public void broadcastTransactionError(String txHash, String errorMessage) {
        String message = String.format("> ⚠ Transaction %s...%s failed: %s",
                txHash.substring(0, 8),
                txHash.substring(txHash.length() - 4),
                errorMessage);
        broadcastConsoleMessage(message, ConsoleMessageType.ERROR);
    }

    /**
     * Broadcast gas estimation warning
     */
    public void broadcastGasWarning(String message) {
        broadcastConsoleMessage("> ⚠ " + message, ConsoleMessageType.WARNING);
    }

    /**
     * Broadcast general blockchain activity
     */
    public void broadcastBlockchainActivity(String activity) {
        broadcastConsoleMessage("> " + activity, ConsoleMessageType.INFO);
    }

    /**
     * Console message types for styling
     */
    public enum ConsoleMessageType {
        SUCCESS, // Green text
        ERROR, // Red text
        WARNING, // Orange text
        INFO // Cyan text
    }
}