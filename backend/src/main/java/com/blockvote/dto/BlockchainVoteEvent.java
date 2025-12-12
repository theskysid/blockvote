package com.blockvote.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigInteger;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BlockchainVoteEvent {

    /**
     * Voter's wallet address
     */
    private String voterAddress;

    /**
     * Candidate ID from the blockchain event
     */
    private BigInteger candidateId;

    /**
     * Transaction hash
     */
    private String transactionHash;

    /**
     * Block number where the event occurred
     */
    private BigInteger blockNumber;

    /**
     * Timestamp when the event was processed
     */
    private LocalDateTime processedAt;

    /**
     * Gas used for the transaction
     */
    private BigInteger gasUsed;

    /**
     * Event log index
     */
    private BigInteger logIndex;

    /**
     * Candidate name (populated from database)
     */
    private String candidateName;
}