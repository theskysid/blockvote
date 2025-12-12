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
        // Only initialize if admin doesn't exist (preserve existing users)
        if (userRepository.findByMobileNumber("9999999999").isEmpty()) {
            // Create Admin User only
            User admin = new User();
            admin.setMobileNumber("9999999999");
            admin.setRole("ADMIN");
            admin.setWalletAddress(null); // Will be set manually in database
            admin.setRegisteredWalletAddress(null); // Will be set manually in database
            admin.setWalletVerified(false); // Will be set manually in database
            admin.setHasVoted(false);
            userRepository.save(admin);
            
            System.out.println("========================================");
            System.out.println("Admin user created:");
            System.out.println("Admin - Mobile: 9999999999, OTP: 123456");
            System.out.println("========================================");
        } else {
            System.out.println("========================================");
            System.out.println("System ready - existing users preserved");
            System.out.println("Admin - Mobile: 9999999999, OTP: 123456");
            System.out.println("========================================");
        }

        System.out.println("Voters can register using /register page");
    }
}
