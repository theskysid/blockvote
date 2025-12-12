package com.blockvote.controller;

import com.blockvote.dto.ApiResponse;
import com.blockvote.service.BlockchainConsoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Test controller for demonstrating blockchain console messages
 */
@RestController
@RequestMapping("/test")
@RequiredArgsConstructor
public class TestConsoleController {

    private final BlockchainConsoleService consoleService;

    /**
     * Simulate blockchain events for demo purposes
     */
    @PostMapping("/simulate-blockchain-events")
    public ResponseEntity<ApiResponse> simulateBlockchainEvents() {
        try {
            // Simulate a sequence of blockchain events
            Thread.sleep(500);
            consoleService.broadcastWalletConnection("0xde18f2e7b5c6a8d4e9f12345678901234567287d");

            Thread.sleep(1000);
            consoleService.broadcastContractDeploymentStart();

            Thread.sleep(2000);
            consoleService.broadcastContractDeploymentSuccess("0xA23b4c5d6e7f890123456789012345678901F212");

            Thread.sleep(1000);
            consoleService.broadcastVoteTransactionSubmitted("Carol", "0xB1c3d4e5f6789012345678901234567890123F221");

            Thread.sleep(500);
            consoleService.broadcastTransactionInMempool("0xB1c3d4e5f6789012345678901234567890123F221");

            Thread.sleep(2000);
            consoleService.broadcastTransactionConfirmed("0xB1c3d4e5f6789012345678901234567890123F221", 2039219L);

            Thread.sleep(1000);
            consoleService.broadcastVoteTransactionSubmitted("Alice", "0xC2d4e6f8901234567890123456789012345678F332");

            Thread.sleep(500);
            consoleService.broadcastTransactionError("0xC2d4e6f8901234567890123456789012345678F332",
                    "insufficient gas");

            Thread.sleep(1000);
            consoleService.broadcastGasWarning("Gas price recommendation: 20 Gwei");

            return ResponseEntity.ok(new ApiResponse(true, "Blockchain events simulated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, "Failed to simulate events: " + e.getMessage()));
        }
    }

    /**
     * Send a custom console message
     */
    @PostMapping("/console-message")
    public ResponseEntity<ApiResponse> sendConsoleMessage(
            @RequestParam String message,
            @RequestParam(defaultValue = "info") String type) {
        try {
            BlockchainConsoleService.ConsoleMessageType messageType;
            try {
                messageType = BlockchainConsoleService.ConsoleMessageType.valueOf(type.toUpperCase());
            } catch (IllegalArgumentException e) {
                messageType = BlockchainConsoleService.ConsoleMessageType.INFO;
            }

            consoleService.broadcastConsoleMessage("> " + message, messageType);
            return ResponseEntity.ok(new ApiResponse(true, "Console message sent"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, "Failed to send message: " + e.getMessage()));
        }
    }
}