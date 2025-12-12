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
    private final BlockchainConsoleService consoleService;

    public List<Candidate> getCandidates() {
        Election currentElection = electionRepository.findTopByOrderByCreatedAtDesc().orElse(null);
        if (currentElection == null) {
            return List.of();
        }
        return candidateRepository.findByElectionIdAndIsActiveTrue(currentElection.getId());
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
                    "Wallet address mismatch! You must vote with your registered wallet address.");
        }

        // Check if user has already voted in this election
        if (user.isHasVoted()) {
            throw new RuntimeException("You have already voted in this election");
        }

        // Find candidate and verify it belongs to current election
        Candidate candidate = candidateRepository.findById(request.getCandidateId())
                .orElseThrow(() -> new RuntimeException("Candidate not found"));

        if (!candidate.getElectionId().equals(election.getId())) {
            throw new RuntimeException("Invalid candidate for current election");
        }

        if (!candidate.getIsActive()) {
            throw new RuntimeException("Candidate is not active in this election");
        }

        // Increment vote count for candidate
        candidate.setVoteCount(candidate.getVoteCount() + 1);
        candidateRepository.save(candidate);

        // Update election total votes
        election.setTotalVotes(election.getTotalVotes() + 1);
        electionRepository.save(election);

        // Mark user as voted
        user.setHasVoted(true);
        userRepository.save(user);

        // Record vote (for audit trail)
        Vote vote = new Vote();
        vote.setVoterMobile(request.getMobileNumber());
        vote.setCandidateId(request.getCandidateId());
        vote.setWalletAddress(request.getWalletAddress());
        vote.setVotedAt(LocalDateTime.now());

        Vote savedVote = voteRepository.save(vote);

        // Simulate blockchain transaction sequence

        // Generate a fake transaction hash for simulation
        String txHash = "0x" + Long.toHexString(System.currentTimeMillis()) +
                Integer.toHexString(request.getWalletAddress().hashCode()).substring(0, 6);

        // Step 1: Vote transaction submitted
        consoleService.broadcastVoteTransactionSubmitted(candidate.getName(), txHash);

        // Step 2: Transaction enters mempool (simulate async)
        new Thread(() -> {
            try {
                Thread.sleep(1000); // Simulate network delay
                consoleService.broadcastTransactionInMempool(txHash);

                Thread.sleep(2000); // Simulate mining time
                // Step 3: Transaction confirmed
                long blockNumber = 2039220L + savedVote.getId(); // Simulate incrementing block numbers
                consoleService.broadcastTransactionConfirmed(txHash, blockNumber);

                // Step 4: Vote recorded in smart contract
                consoleService.broadcastBlockchainActivity(
                        String.format("Smart contract updated: %s vote count incremented", candidate.getName()));

            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }).start();

        return savedVote;
    }

    public boolean hasVoted(String mobileNumber) {
        return voteRepository.existsByVoterMobile(mobileNumber);
    }
}
