package com.blockvote.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String mobileNumber;

    @Column(nullable = false)
    private String role; // ADMIN or VOTER

    @Column(unique = true) // Nullable - voters set this after MetaMask verification
    private String walletAddress;

    @Column(nullable = false)
    private boolean hasVoted = false;

    // MetaMask wallet address (registered via signature verification)
    @Column(unique = true) // Nullable - set after wallet verification
    private String registeredWalletAddress;

    // Indicates if wallet has been verified and bound
    @Column(nullable = false)
    private boolean walletVerified = false;
}
