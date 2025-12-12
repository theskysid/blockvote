package com.blockvote.service;

import com.blockvote.dto.CandidateRequest;
import com.blockvote.entity.Candidate;
import com.blockvote.entity.Election;
import com.blockvote.repository.CandidateRepository;
import com.blockvote.repository.ElectionRepository;
import com.blockvote.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final ElectionRepository electionRepository;
    private final CandidateRepository candidateRepository;
    private final UserRepository userRepository;
    private final BlockchainConsoleService consoleService;

    @Transactional
    public Election createElection(String title) {
        // Validate title
        if (title == null || title.trim().isEmpty()) {
            throw new RuntimeException("Election title cannot be empty");
        }

        // Stop any previous active election first
        stopAnyActiveElection();

        Election election = new Election();
        election.setTitle(title.trim());
        election.setStatus("CREATED");
        election.setCreatedAt(LocalDateTime.now());
        election.setTotalVotes(0);

        consoleService.broadcastContractDeploymentStart();
        Election savedElection = electionRepository.save(election);

        // Reset all users' voting status for fresh election
        resetAllVotingStatus();

        // Simulate contract deployment process
        new Thread(() -> {
            try {
                Thread.sleep(2000); // Simulate deployment time
                String contractAddress = "0xA23b4c5d6e7f890123456789012345678901F" + savedElection.getId();
                consoleService.broadcastContractDeploymentSuccess(contractAddress);

                Thread.sleep(500);
                consoleService.broadcastBlockchainActivity("Fresh election created - all votes reset");

            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }).start();

        return savedElection;
    }

    @Transactional
    private void stopAnyActiveElection() {
        electionRepository.findByStatus("ACTIVE").forEach(election -> {
            election.setStatus("STOPPED");
            election.setStoppedAt(LocalDateTime.now());
            // Store final results before stopping
            storeFinalResults(election);
        });
    }

    @Transactional
    private void resetAllVotingStatus() {
        userRepository.findAll().forEach(user -> {
            user.setHasVoted(false);
            userRepository.save(user);
        });
        consoleService.broadcastBlockchainActivity("All voter statuses reset for new election");
    }

    @Transactional
    public Candidate addCandidate(CandidateRequest request) {
        // Get the current election in CREATED status
        Election currentElection = electionRepository.findByStatusOrderByCreatedAtDesc("CREATED")
                .orElseThrow(() -> new RuntimeException("No active election found to add candidates"));

        Candidate candidate = new Candidate();
        candidate.setName(request.getName());
        candidate.setParty(request.getParty());
        candidate.setVoteCount(0);
        candidate.setElection(currentElection);
        candidate.setElectionId(currentElection.getId());
        candidate.setIsActive(true);

        Candidate savedCandidate = candidateRepository.save(candidate);

        // Simulate smart contract transaction for adding candidate
        String txHash = "0xC" + Long.toHexString(System.currentTimeMillis()).substring(0, 8) +
                Integer.toHexString(request.getName().hashCode()).substring(0, 6);

        consoleService.broadcastVoteTransactionSubmitted(
                "addCandidate(" + request.getName() + ")", txHash);

        // Simulate async blockchain confirmation
        new Thread(() -> {
            try {
                Thread.sleep(1500);
                consoleService.broadcastTransactionConfirmed(txHash, 2039215L + savedCandidate.getId());

                Thread.sleep(300);
                consoleService.broadcastBlockchainActivity(
                        String.format("Candidate registered on blockchain: %s (%s)",
                                request.getName(), request.getParty()));

            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }).start();

        return savedCandidate;
    }

    @Transactional
    public Election startElection() {
        Election election = electionRepository.findByStatusOrderByCreatedAtDesc("CREATED")
                .orElseThrow(() -> new RuntimeException("No election in CREATED status found"));

        // Check if there are candidates
        List<Candidate> candidates = candidateRepository.findByElectionIdAndIsActiveTrue(election.getId());
        if (candidates.isEmpty()) {
            throw new RuntimeException("Cannot start election without candidates. Please add candidates first.");
        }

        election.setStatus("ACTIVE");
        election.setStartedAt(LocalDateTime.now());

        // Reset vote counts for fresh start
        candidateRepository.resetVoteCountsByElectionId(election.getId());
        election.setTotalVotes(0);

        Election savedElection = electionRepository.save(election);

        // Simulate smart contract call to start voting
        String txHash = "0xS" + Long.toHexString(System.currentTimeMillis()).substring(0, 10);
        consoleService.broadcastVoteTransactionSubmitted("startVoting()", txHash);

        new Thread(() -> {
            try {
                Thread.sleep(1200);
                consoleService.broadcastTransactionConfirmed(txHash, 2039210L + savedElection.getId());

                Thread.sleep(200);
                consoleService.broadcastBlockchainActivity("Election started - voting is now active on blockchain");

            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }).start();

        return savedElection;
    }

    @Transactional
    public Election stopElection() {
        Election election = electionRepository.findByStatusOrderByCreatedAtDesc("ACTIVE")
                .orElseThrow(() -> new RuntimeException("No active election found"));

        election.setStatus("STOPPED");
        election.setStoppedAt(LocalDateTime.now());

        // Store final results
        storeFinalResults(election);

        Election savedElection = electionRepository.save(election);

        // Simulate smart contract call to stop voting
        String txHash = "0xE" + Long.toHexString(System.currentTimeMillis()).substring(0, 10);
        consoleService.broadcastVoteTransactionSubmitted("stopVoting()", txHash);

        new Thread(() -> {
            try {
                Thread.sleep(1000);
                consoleService.broadcastTransactionConfirmed(txHash, 2039230L + savedElection.getId());

                Thread.sleep(200);
                consoleService.broadcastBlockchainActivity("Election stopped - voting is now closed on blockchain");

                Thread.sleep(300);
                consoleService.broadcastBlockchainActivity("Final results sealed in smart contract");

            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }).start();

        return savedElection;
    }

    private void storeFinalResults(Election election) {
        List<Candidate> candidates = candidateRepository.findByElectionId(election.getId());

        Map<String, Object> results = new HashMap<>();
        results.put("electionId", election.getId());
        results.put("electionTitle", election.getTitle());
        results.put("totalVotes", election.getTotalVotes());
        results.put("candidates", candidates.stream().map(c -> {
            Map<String, Object> candidateResult = new HashMap<>();
            candidateResult.put("name", c.getName());
            candidateResult.put("party", c.getParty());
            candidateResult.put("voteCount", c.getVoteCount());
            return candidateResult;
        }).collect(Collectors.toList()));

        try {
            // Note: In real implementation, this would use ObjectMapper
            // For now, store as simple string representation
            election.setFinalResults(results.toString());
        } catch (Exception e) {
            consoleService.broadcastBlockchainActivity("Error storing election results: " + e.getMessage());
        }
    }

    public Map<String, Object> getResults() {
        Election currentElection = electionRepository.findTopByOrderByCreatedAtDesc().orElse(null);

        if (currentElection == null) {
            return Map.of("totalVotes", 0, "results", List.of(), "message", "No election found");
        }

        List<Candidate> candidates = candidateRepository.findByElectionId(currentElection.getId());

        int totalVotes = candidates.stream()
                .mapToInt(Candidate::getVoteCount)
                .sum();

        List<Map<String, Object>> results = candidates.stream()
                .map(c -> {
                    Map<String, Object> result = new HashMap<>();
                    result.put("id", c.getId());
                    result.put("name", c.getName());
                    result.put("party", c.getParty());
                    result.put("voteCount", c.getVoteCount());
                    return result;
                })
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("totalVotes", totalVotes);
        response.put("results", results);
        response.put("electionId", currentElection.getId());
        response.put("electionStatus", currentElection.getStatus());

        return response;
    }

    public List<Candidate> getCandidatesForCurrentElection() {
        Election currentElection = electionRepository.findTopByOrderByCreatedAtDesc().orElse(null);
        if (currentElection == null) {
            return List.of();
        }
        return candidateRepository.findByElectionIdAndIsActiveTrue(currentElection.getId());
    }

    public Election getElectionStatus() {
        return electionRepository.findTopByOrderByCreatedAtDesc()
                .orElse(null);
    }

    @Transactional
    public void resetElection() {
        Election currentElection = electionRepository.findTopByOrderByCreatedAtDesc().orElse(null);
        if (currentElection != null) {
            // Delete all candidates for current election
            candidateRepository.deleteByElectionId(currentElection.getId());

            // Reset election status
            currentElection.setStatus("CREATED");
            currentElection.setStartedAt(null);
            currentElection.setStoppedAt(null);
            currentElection.setTotalVotes(0);
            electionRepository.save(currentElection);

            // Reset all voting statuses
            resetAllVotingStatus();

            consoleService.broadcastBlockchainActivity("Election reset - ready to add new candidates");
        }
    }

    // Archive related methods
    public List<Election> getArchivedElections() {
        return electionRepository.findByStatusOrderByStoppedAtDesc("STOPPED");
    }

    public Election getArchivedElectionById(Long id) {
        return electionRepository.findByIdAndStatus(id, "STOPPED")
                .orElseThrow(() -> new RuntimeException("Archived election not found with id: " + id));
    }

    public Map<String, Object> getElectionStatistics(Long electionId) {
        Election election = getArchivedElectionById(electionId);
        List<Candidate> candidates = candidateRepository.findByElectionIdAndIsActiveTrue(electionId);

        Map<String, Object> stats = new HashMap<>();
        stats.put("election", election);
        stats.put("candidates", candidates);
        stats.put("totalVotes", election.getTotalVotes());
        stats.put("duration", calculateElectionDuration(election));
        
        // Calculate winner
        Candidate winner = candidates.stream()
                .max((c1, c2) -> Integer.compare(c1.getVoteCount(), c2.getVoteCount()))
                .orElse(null);
        stats.put("winner", winner);
        
        // Calculate vote percentages
        if (election.getTotalVotes() > 0) {
            Map<String, Double> percentages = candidates.stream()
                    .collect(Collectors.toMap(
                            Candidate::getName,
                            c -> (double) c.getVoteCount() / election.getTotalVotes() * 100
                    ));
            stats.put("votePercentages", percentages);
        }

        return stats;
    }

    private String calculateElectionDuration(Election election) {
        if (election.getStartedAt() == null || election.getStoppedAt() == null) {
            return "Unknown";
        }
        
        long minutes = java.time.Duration.between(election.getStartedAt(), election.getStoppedAt()).toMinutes();
        if (minutes < 60) {
            return minutes + " minutes";
        } else {
            long hours = minutes / 60;
            long remainingMinutes = minutes % 60;
            return hours + " hours " + (remainingMinutes > 0 ? remainingMinutes + " minutes" : "");
        }
    }
}
