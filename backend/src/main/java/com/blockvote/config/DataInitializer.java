package com.blockvote.config;

import com.blockvote.entity.User;
import com.blockvote.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;

    @Override
    public void run(String... args) {
        // Clear existing users (for fresh start in dev mode)
        userRepository.deleteAll();

        // Create Admin User only
        User admin = new User();
        admin.setMobileNumber("9999999999");
        admin.setRole("ADMIN");
        admin.setWalletAddress(null); // Will be set after MetaMask connection
        admin.setRegisteredWalletAddress(null);
        admin.setWalletVerified(false); // Must verify via MetaMask
        admin.setHasVoted(false);
        userRepository.save(admin);

        System.out.println("========================================");
        System.out.println("System Initialized:");
        System.out.println("Admin - Mobile: 9999999999, OTP: 123456");
        System.out.println("Voters can register using /register page");
        System.out.println("========================================");
    }
}
