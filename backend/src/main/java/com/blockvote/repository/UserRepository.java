package com.blockvote.repository;

import com.blockvote.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByMobileNumber(String mobileNumber);

    Optional<User> findByWalletAddress(String walletAddress);

    Optional<User> findByRegisteredWalletAddress(String registeredWalletAddress);
}
