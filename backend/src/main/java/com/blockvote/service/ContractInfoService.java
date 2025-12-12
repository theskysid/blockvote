package com.blockvote.service;

import com.blockvote.config.BlockchainConfig;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Service to manage blockchain contract deployment information
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ContractInfoService {

    private final BlockchainConfig blockchainConfig;
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Check if the contract is deployed by verifying deployment files exist
     */
    public boolean isContractDeployed() {
        try {
            String contractAddress = getContractAddress();
            return contractAddress != null && !contractAddress.trim().isEmpty();
        } catch (Exception e) {
            log.debug("Contract not deployed or deployment info unavailable: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Get the deployed contract address from deployment files
     */
    public String getContractAddress() {
        try {
            // Try to read from deployed.json file
            Path deployedJsonPath = getDeploymentFilePath("deployed.json");
            File deployedFile = deployedJsonPath.toFile();

            if (deployedFile.exists()) {
                JsonNode deployedInfo = objectMapper.readTree(deployedFile);
                JsonNode addressNode = deployedInfo.get("contractAddress");
                if (addressNode != null && !addressNode.isNull()) {
                    String address = addressNode.asText();
                    log.debug("Found contract address in deployed.json: {}", address);
                    return address;
                }
            }

            log.warn("Contract address not found in deployment files");
            return null;

        } catch (IOException e) {
            log.error("Error reading contract deployment info", e);
            return null;
        }
    }

    /**
     * Get the contract ABI from deployment files
     */
    public JsonNode getContractABI() {
        try {
            // Try to read from VotingABI.json file
            Path abiJsonPath = getDeploymentFilePath("VotingABI.json");
            File abiFile = abiJsonPath.toFile();

            if (abiFile.exists()) {
                JsonNode abiInfo = objectMapper.readTree(abiFile);
                log.debug("Found contract ABI in VotingABI.json");
                return abiInfo;
            }

            log.warn("Contract ABI not found in deployment files");
            return null;

        } catch (IOException e) {
            log.error("Error reading contract ABI", e);
            return null;
        }
    }

    /**
     * Get the full path to a deployment file
     */
    private Path getDeploymentFilePath(String filename) {
        return Paths.get(blockchainConfig.getContractDeploymentPath(), filename);
    }

    /**
     * Get deployment directory path
     */
    public String getDeploymentPath() {
        return blockchainConfig.getContractDeploymentPath();
    }
}