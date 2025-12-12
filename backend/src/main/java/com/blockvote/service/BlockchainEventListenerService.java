package com.blockvote.service;

import com.blockvote.config.BlockchainConfig;
import com.blockvote.dto.BlockchainVoteEvent;
import com.blockvote.entity.Candidate;
import com.blockvote.entity.Vote;
import com.blockvote.repository.CandidateRepository;
import com.blockvote.repository.VoteRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.web3j.abi.EventEncoder;
import org.web3j.abi.EventValues;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.Address;
import org.web3j.abi.datatypes.Event;
import org.web3j.abi.datatypes.Uint;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameterName;
import org.web3j.protocol.core.methods.request.EthFilter;
import org.web3j.protocol.core.methods.response.EthLog;
import org.web3j.protocol.core.methods.response.Log;
import org.web3j.protocol.http.HttpService;
import org.web3j.tx.Contract;
import org.web3j.tx.gas.DefaultGasProvider;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import java.math.BigInteger;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicReference;

@Service
@RequiredArgsConstructor
@Slf4j
public class BlockchainEventListenerService {

    private final BlockchainConfig blockchainConfig;
    private final ContractInfoService contractInfoService;
    private final VoteRepository voteRepository;
    private final CandidateRepository candidateRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;
    private final BlockchainConsoleService consoleService;

    private Web3j web3j;
    private final AtomicBoolean isListening = new AtomicBoolean(false);
    private final AtomicReference<BigInteger> lastProcessedBlock = new AtomicReference<>(BigInteger.ZERO);

    // Define the VoteCast event signature
    // event VoteCast(address indexed voter, uint candidateId)
    private static final Event VOTE_CAST_EVENT = new Event("VoteCast",
            Arrays.asList(
                    new TypeReference<Address>(true) {
                    }, // indexed voter address
                    new TypeReference<Uint256>(false) {
                    } // candidateId
            ));

    @PostConstruct
    public void initialize() {
        // Check if blockchain is enabled
        if (!blockchainConfig.getEnabled()) {
            log.info("Blockchain integration is disabled. Skipping blockchain event listener initialization.");
            return;
        }

        try {
            // Initialize Web3j connection
            web3j = Web3j.build(new HttpService(blockchainConfig.getRpcUrl()));

            // Test connection
            String clientVersion = web3j.web3ClientVersion().send().getWeb3ClientVersion();
            log.info("Connected to Ethereum client: {}", clientVersion);

            // Start listening if contract is deployed
            if (contractInfoService.isContractDeployed()) {
                startListening();
            } else {
                log.warn("Contract not deployed yet. Event listener will start when contract becomes available.");
            }

        } catch (Exception e) {
            log.error("Failed to initialize blockchain connection", e);
        }
    }

    @PreDestroy
    public void cleanup() {
        if (web3j != null) {
            web3j.shutdown();
        }
        isListening.set(false);
    }

    /**
     * Start listening for blockchain events
     */
    public void startListening() {
        if (isListening.get()) {
            log.info("Event listener is already running");
            return;
        }

        String contractAddress = contractInfoService.getContractAddress();
        if (contractAddress == null || contractAddress.isEmpty()) {
            log.error("Cannot start listening: Contract address not available");
            return;
        }

        isListening.set(true);
        log.info("Starting blockchain event listener for contract: {}", contractAddress);

        // Initialize last processed block to current block - maxBlockRange
        try {
            BigInteger currentBlock = web3j.ethBlockNumber().send().getBlockNumber();
            BigInteger startBlock = currentBlock.subtract(BigInteger.valueOf(blockchainConfig.getMaxBlockRange()));
            if (startBlock.compareTo(BigInteger.ZERO) < 0) {
                startBlock = BigInteger.ZERO;
            }
            lastProcessedBlock.set(startBlock);
            log.info("Starting event processing from block: {}", startBlock);
        } catch (Exception e) {
            log.error("Failed to get current block number", e);
            lastProcessedBlock.set(BigInteger.ZERO);
        }
    }

    /**
     * Stop listening for blockchain events
     */
    public void stopListening() {
        isListening.set(false);
        log.info("Blockchain event listener stopped");
    }

    /**
     * Scheduled method to poll for new events
     */
    @Scheduled(fixedDelayString = "#{@blockchainConfig.pollingInterval}")
    @Async
    public void pollForEvents() {
        if (!blockchainConfig.getEnabled() || !isListening.get()) {
            return;
        }

        try {
            String contractAddress = contractInfoService.getContractAddress();
            if (contractAddress == null) {
                // Check if contract becomes available
                if (contractInfoService.isContractDeployed()) {
                    startListening();
                }
                return;
            }

            // Get current block
            BigInteger currentBlock = web3j.ethBlockNumber().send().getBlockNumber();
            BigInteger fromBlock = lastProcessedBlock.get().add(BigInteger.ONE);

            if (fromBlock.compareTo(currentBlock) > 0) {
                // No new blocks to process
                return;
            }

            // Create filter for VoteCast events
            EthFilter filter = new EthFilter(
                    org.web3j.protocol.core.DefaultBlockParameter.valueOf(fromBlock),
                    org.web3j.protocol.core.DefaultBlockParameter.valueOf(currentBlock),
                    contractAddress);

            // Add event signature to filter
            filter.addSingleTopic(EventEncoder.encode(VOTE_CAST_EVENT));

            // Get logs
            EthLog ethLog = web3j.ethGetLogs(filter).send();
            List<EthLog.LogResult> logs = ethLog.getLogs();

            if (!logs.isEmpty()) {
                log.info("Found {} VoteCast events to process", logs.size());

                for (EthLog.LogResult logResult : logs) {
                    if (logResult instanceof EthLog.LogObject) {
                        processVoteCastEvent((Log) logResult.get());
                    }
                }
            }

            // Update last processed block
            lastProcessedBlock.set(currentBlock);

        } catch (Exception e) {
            log.error("Error polling for blockchain events", e);
        }
    }

    /**
     * Process a single VoteCast event
     */
    private void processVoteCastEvent(Log eventLog) {
        try {
            // Decode the event
            EventValues eventValues = Contract.staticExtractEventParameters(VOTE_CAST_EVENT, eventLog);

            if (eventValues == null || eventValues.getIndexedValues().size() < 1
                    || eventValues.getNonIndexedValues().size() < 1) {
                log.warn("Invalid VoteCast event format");
                return;
            }

            // Extract voter address (indexed parameter)
            Address voterAddress = (Address) eventValues.getIndexedValues().get(0);

            // Extract candidate ID (non-indexed parameter)
            Uint256 candidateId = (Uint256) eventValues.getNonIndexedValues().get(0);

            String voter = voterAddress.getValue();
            BigInteger candidateIdBig = candidateId.getValue();

            log.info("Processing VoteCast event: voter={}, candidateId={}, txHash={}",
                    voter, candidateIdBig, eventLog.getTransactionHash());

            // Create blockchain vote event DTO
            BlockchainVoteEvent voteEvent = new BlockchainVoteEvent();
            voteEvent.setVoterAddress(voter);
            voteEvent.setCandidateId(candidateIdBig);
            voteEvent.setTransactionHash(eventLog.getTransactionHash());
            voteEvent.setBlockNumber(eventLog.getBlockNumber());
            voteEvent.setProcessedAt(LocalDateTime.now());
            voteEvent.setGasUsed(BigInteger.ZERO); // Can be fetched from transaction receipt if needed
            voteEvent.setLogIndex(eventLog.getLogIndex());

            // Check if this vote was already processed
            if (voteRepository.existsByWalletAddressAndTransactionHash(voter, eventLog.getTransactionHash())) {
                log.info("Vote already processed for transaction: {}", eventLog.getTransactionHash());
                return;
            }

            // Update database
            updateDatabaseWithVote(voteEvent);

            // Broadcast WebSocket event
            broadcastVoteEvent(voteEvent);

            // Broadcast to console
            consoleService.broadcastVoteTransactionSubmitted(
                    voteEvent.getCandidateName(),
                    voteEvent.getTransactionHash());
            consoleService.broadcastTransactionConfirmed(
                    voteEvent.getTransactionHash(),
                    voteEvent.getBlockNumber().longValue());

        } catch (Exception e) {
            log.error("Error processing VoteCast event", e);
            consoleService.broadcastTransactionError(
                    eventLog.getTransactionHash(),
                    "Processing failed: " + e.getMessage());
        }
    }

    /**
     * Update PostgreSQL database with the blockchain vote
     */
    private void updateDatabaseWithVote(BlockchainVoteEvent voteEvent) {
        try {
            Long candidateId = voteEvent.getCandidateId().longValue();

            // Find candidate
            Optional<Candidate> candidateOpt = candidateRepository.findById(candidateId);
            if (candidateOpt.isEmpty()) {
                log.error("Candidate not found with ID: {}", candidateId);
                return;
            }

            Candidate candidate = candidateOpt.get();

            // Create vote record
            Vote vote = new Vote();
            vote.setVoterMobile("BLOCKCHAIN_VOTE"); // Special marker for blockchain votes
            vote.setCandidateId(candidateId);
            vote.setWalletAddress(voteEvent.getVoterAddress());
            vote.setVotedAt(voteEvent.getProcessedAt());
            vote.setTransactionHash(voteEvent.getTransactionHash());
            vote.setBlockNumber(voteEvent.getBlockNumber().longValue());

            voteRepository.save(vote);

            // Update candidate vote count
            candidate.setVoteCount(candidate.getVoteCount() + 1);
            candidateRepository.save(candidate);

            // Store candidate name for broadcasting
            voteEvent.setCandidateName(candidate.getName());

            log.info("Database updated: candidate {} now has {} votes",
                    candidate.getName(), candidate.getVoteCount());

        } catch (Exception e) {
            log.error("Error updating database with blockchain vote", e);
        }
    }

    /**
     * Broadcast vote confirmation via WebSocket
     */
    private void broadcastVoteEvent(BlockchainVoteEvent voteEvent) {
        try {
            // Sanitize wallet address (show first 6 and last 4 characters)
            String sanitizedAddress = voteEvent.getVoterAddress().substring(0, 6) + "..." +
                    voteEvent.getVoterAddress().substring(voteEvent.getVoterAddress().length() - 4);

            // Create message payload
            var message = new java.util.HashMap<String, Object>();
            message.put("type", "VOTE_CAST_BLOCKCHAIN");
            message.put("walletAddress", sanitizedAddress);
            message.put("candidateName", voteEvent.getCandidateName());
            message.put("candidateId", voteEvent.getCandidateId().longValue());
            message.put("transactionHash", voteEvent.getTransactionHash());
            message.put("blockNumber", voteEvent.getBlockNumber().longValue());
            message.put("timestamp", voteEvent.getProcessedAt().toString());

            // Broadcast to both general and admin activity topics
            messagingTemplate.convertAndSend("/topic/activities", message);
            messagingTemplate.convertAndSend("/topic/admin/activities", message);

            log.info("Broadcasted blockchain vote event: {} voted for {} via WebSocket",
                    sanitizedAddress, voteEvent.getCandidateName());

        } catch (Exception e) {
            log.error("Error broadcasting vote event via WebSocket", e);
        }
    }

    /**
     * Get listener status
     */
    public boolean isListening() {
        return isListening.get();
    }

    /**
     * Get last processed block
     */
    public BigInteger getLastProcessedBlock() {
        return lastProcessedBlock.get();
    }
}