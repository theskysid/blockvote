package com.blockvote.service;

import com.blockvote.dto.VoteRequest;
import com.blockvote.entity.Candidate;
import com.blockvote.entity.Election;
import com.blockvote.entity.User;
import com.blockvote.entity.Vote;
import com.blockvote.repository.CandidateRepository;
import com.blockvote.repository.ElectionRepository;
import com.blockvote.repository.UserRepository;
import com.blockvote.repository.VoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VoterService {

    private final CandidateRepository candidateRepository;
    private final VoteRepository voteRepository;
    private final UserRepository userRepository;
    private final ElectionRepository electionRepository;

    public List<Candidate> getCandidates() {
        return candidateRepository.findAll();
    }

    @Transactional
    public Vote castVote(VoteRequest request) {
        // Check if election is active
        Election election = electionRepository.findTopByOrderByCreatedAtDesc()
                .orElseThrow(() -> new RuntimeException("No election found"));

        if (!"ACTIVE".equals(election.getStatus())) {
            throw new RuntimeException("Election is not active");
        }

        // Check if user exists
        User user = userRepository.findByMobileNumber(request.getMobileNumber())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // CRITICAL: Enforce wallet verification before voting
        if (!user.isWalletVerified()) {
            throw new RuntimeException(
                    "Wallet not verified! Please connect and verify your MetaMask wallet before voting.");
        }

        if (user.getRegisteredWalletAddress() == null) {
            throw new RuntimeException(
                    "No wallet registered! Please connect your MetaMask wallet first.");
        }

        // Verify the wallet address matches the registered one
        String normalizedRegistered = user.getRegisteredWalletAddress().toLowerCase();
        String normalizedProvided = request.getWalletAddress().toLowerCase();

        if (!normalizedRegistered.equals(normalizedProvided)) {
            throw new RuntimeException(
                    "Wallet mismatch! You must vote with your registered wallet: " +
                            user.getRegisteredWalletAddress());
        }

        // Check if user has already voted
        if (voteRepository.existsByVoterMobile(request.getMobileNumber())) {
            throw new RuntimeException("You have already voted");
        }

        if (user.isHasVoted()) {
            throw new RuntimeException("You have already voted");
        }

        // Find candidate
        Candidate candidate = candidateRepository.findById(request.getCandidateId())
                .orElseThrow(() -> new RuntimeException("Candidate not found"));

        // Increment vote count
        candidate.setVoteCount(candidate.getVoteCount() + 1);
        candidateRepository.save(candidate);

        // Mark user as voted
        user.setHasVoted(true);
        userRepository.save(user);

        // Record vote
        Vote vote = new Vote();
        vote.setVoterMobile(request.getMobileNumber());
        vote.setCandidateId(request.getCandidateId());
        vote.setWalletAddress(request.getWalletAddress());
        vote.setVotedAt(LocalDateTime.now());

        return voteRepository.save(vote);
    }

    public boolean hasVoted(String mobileNumber) {
        return voteRepository.existsByVoterMobile(mobileNumber);
    }
}
