package com.blockvote.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Configuration properties for blockchain integration
 */
@Component
@ConfigurationProperties(prefix = "blockchain")
@Data
public class BlockchainConfig {

    /**
     * Blockchain RPC URL (default: Hardhat local network)
     */
    private String rpcUrl = "http://127.0.0.1:8545";

    /**
     * Chain ID (default: Hardhat local network)
     */
    private Long chainId = 31337L;

    /**
     * Maximum block range to scan for events in one request
     */
    private Integer maxBlockRange = 1000;

    /**
     * Event listener polling interval in milliseconds
     */
    private Long pollingInterval = 5000L;

    /**
     * Whether to enable blockchain event listening
     */
    private Boolean enabled = true;

    /**
     * Contract deployment directory path
     */
    private String contractDeploymentPath = "../blockchain";
}