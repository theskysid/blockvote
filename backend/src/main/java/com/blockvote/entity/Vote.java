package com.blockvote.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "votes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Vote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String voterMobile;

    @Column(nullable = false)
    private Long candidateId;

    @Column(nullable = false)
    private LocalDateTime votedAt;

    @Column(nullable = false)
    private String walletAddress;

    @Column(name = "transaction_hash")
    private String transactionHash;

    @Column(name = "block_number")
    private Long blockNumber;
}
